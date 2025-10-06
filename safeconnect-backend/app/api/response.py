from app.api.load_models import models, tokenizers
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import torch
import re

router = APIRouter()

LABELS_MODEL1 = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']
LABELS_MODEL2 = ['distress', 'SuicideWatch', 'depression', 'safe']


class MessageRequest(BaseModel):
    messages: List[str]             
    age: Optional[int] = None 


def contains_suicidal_keywords(text: str) -> bool:
    """Check if text contains clear suicidal intent keywords"""
    suicidal_patterns = [
        r'end\s+(it\s+)?all', r'end\s+my\s+life', r'kill\s+my\s+self',
        r'kill\s+myself', r'suicide', r'want\s+to\s+die', r'don\'t\s+want\s+to\s+live',
        r'better\s+off\s+dead', r'no\s+reason\s+to\s+live', r'take\s+my\s+life',
        r'end\s+everything', r'end\s+it'
    ]
    text_lower = text.lower()
    return any(re.search(pattern, text_lower) for pattern in suicidal_patterns)


@router.post("/predict")
async def predict_pipeline(req: MessageRequest):
    messages = req.messages
    age = req.age

    if not messages:
        raise HTTPException(status_code=400, detail="No messages provided.")

    # Initialize models
    tok1 = tokenizers["safety_bert_model"]
    mod1 = models["safety_bert_model"]
    tok2 = tokenizers["safety2_bert_model"]
    mod2 = models["safety2_bert_model"]

    results = []
    mental_health_risk_count = 0
    toxic_found = False
    suicidal_intent_detected = False

    # Analyze all messages
    for text in messages:
        # Check for suicidal keywords first (highest priority)
        is_suicidal_keyword = contains_suicidal_keywords(text)
        
        # Stage 1: Check for toxic content
        inputs1 = tok1(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
        with torch.no_grad():
            probs1 = torch.sigmoid(mod1(**inputs1).logits).detach().cpu().numpy()[0]
        toxic_labels = [label for label, prob in zip(LABELS_MODEL1, probs1) if prob > 0.5]
        is_toxic = len(toxic_labels) > 0

        # Override toxic classification if suicidal intent is detected
        if is_suicidal_keyword:
            # Treat as mental health emergency regardless of toxic classification
            final_label = "SuicideWatch"
            mental_health_risk_count += 1
            suicidal_intent_detected = True
            results.append({
                "text": text,
                "label": final_label,
                "model1_labels": toxic_labels,
                "model2_label": final_label,
                "suicidal_keyword_detected": True
            })
            continue

        if is_toxic:
            toxic_found = True
            results.append({
                "text": text, 
                "label": "abusive", 
                "model1_labels": toxic_labels,
                "model2_label": None,
                "suicidal_keyword_detected": False
            })
            continue

        # Stage 2: Mental health analysis (only if not toxic and not suicidal keywords)
        inputs2 = tok2(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
        with torch.no_grad():
            logits2 = mod2(**inputs2).logits
        pred2 = torch.argmax(logits2, dim=1).item()
        final_label = LABELS_MODEL2[pred2]

        # Count mental health risks
        if final_label in ["distress", "SuicideWatch", "depression"]:
            mental_health_risk_count += 1

        results.append({
            "text": text,
            "label": final_label,
            "model1_labels": toxic_labels,
            "model2_label": final_label,
            "suicidal_keyword_detected": False
        })

    # Get current message analysis (last message in the list)
    current_msg_analysis = results[-1]

    # Decision Logic - UPDATED PRIORITY
    response_message = ""
    action_taken = ""

    # Priority 1: Handle suicidal intent (HIGHEST PRIORITY)
    if suicidal_intent_detected:
        total_messages = len(messages)
        
        if mental_health_risk_count == total_messages:  # All messages show risk
            if age is not None and age < 18:
                response_message = " IMMEDIATE SUPPORT NEEDED: I'm extremely concerned about your safety. I've immediately notified both our crisis team and your guardian. Please stay on the line - help is coming. Call 1-800-273-8255 RIGHT NOW or text HOME to 741741. You are not alone."
                action_taken = "CRITICAL - Guardian and crisis team notified immediately"
            else:
                response_message = " IMMEDIATE SUPPORT NEEDED: I'm extremely concerned about your safety. Our crisis team has been notified and will contact you immediately. Please call 1-800-273-8255 RIGHT NOW or text HOME to 741741. Help is available 24/7."
                action_taken = "CRITICAL - Crisis team notified immediately"
                
        elif mental_health_risk_count >= 2:  # Multiple concerning messages
            if age is not None and age < 18:
                response_message = " URGENT: I'm very concerned about what you're sharing. I've immediately notified our crisis team and your guardian. Please call Teen Line at 1-800-852-8336 or the National Suicide Prevention Lifeline at 1-800-273-8255. You matter and help is here."
                action_taken = "URGENT - Guardian and crisis team notified"
            else:
                response_message = " URGENT: I'm very concerned about your messages. Our crisis team has been notified and will contact you immediately. Please call 1-800-273-8255 or text HOME to 741741. Professional support is available right now."
                action_taken = "URGENT - Crisis team notified"
                
        else:  # Single message with suicidal intent
            response_message = "I'm very concerned about what you shared. Your life matters. Please reach out to the National Suicide Prevention Lifeline at 1-800-273-8255 or text HOME to 741741 - they're available 24/7. Our team has been alerted to check in with you."
            action_taken = "HIGH RISK - Crisis resources provided and team alerted"

    # Priority 2: Handle toxic content (but NOT suicidal)
    elif current_msg_analysis["label"] == "abusive" and not suicidal_intent_detected:
        response_message = "Your message contains inappropriate content. Please maintain a respectful conversation. Repeated violations may result in account restrictions."
        action_taken = "Content moderation warning sent"

    # Priority 3: Handle mental health risks (non-suicidal)
    elif current_msg_analysis.get("model2_label") in ["distress", "SuicideWatch", "depression"]:
        total_messages = len(messages)
        
        if mental_health_risk_count == total_messages:  # All messages show risk
            response_message = "I'm really concerned about what you're sharing. Please know you're not alone. Our helpline team has been notified and will reach out to support you. In the meantime, you can contact the National Suicide Prevention Lifeline at 1-800-273-8255 or text HOME to 741741."
            action_taken = "High risk - Helpline team notified"
            
        elif mental_health_risk_count >= 2:  # At least 2 messages show risk
            if age is not None and age < 18:
                response_message = f"I can see you're going through a difficult time. I've notified both our helpline team and your guardian to make sure you get the support you need. Remember, it's okay to ask for help. You can also reach out to Teen Line at 1-800-852-8336."
                action_taken = "Medium risk - Guardian and helpline notified"
            else:
                response_message = "I'm concerned about the pattern I'm seeing in your messages. Our helpline team has been notified and will contact you shortly. Please remember that professional support is available 24/7 at 1-800-273-8255."
                action_taken = "Medium risk - Helpline team notified"
                
        else:  # Only current message shows risk (1 message) 
            response_message = "I hear that you're going through a tough time. Please know that you're not alone and support is available. Feel free to reach out to mental health professionals at 1-800-273-8255 or visit https://suicidepreventionlifeline.org for immediate help."
            action_taken = "Low risk - Resources provided"

    # Priority 4: Normal conversation
    else:
        response_message = "Thank you for sharing. I'm here to listen if you need to talk more."
        action_taken = "Normal conversation"

    return {
        "final_label": current_msg_analysis["label"],
        "risk_level": mental_health_risk_count,
        "age": age,
        "response_message": response_message,
        "action_taken": action_taken,
        "message_count": len(messages),
        "mental_health_risk_messages": mental_health_risk_count,
        "toxic_detected": toxic_found,
        "suicidal_intent_detected": suicidal_intent_detected,
        "details": results
    }