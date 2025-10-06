# app/api/load_models.py
from fastapi import APIRouter
from transformers import BertTokenizer, BertForSequenceClassification

router = APIRouter()

# Global models
models = {}
tokenizers = {}

@router.on_event("startup")
def load_models_on_startup():
    global models, tokenizers
    print("Loading BERT models...")

    model_names = ["safety_bert_model", "safety2_bert_model"]
    base_path = "models"

    for name in model_names:
        model_path = f"{base_path}/{name}"
        print(f"Loading {name}...")
        models[name] = BertForSequenceClassification.from_pretrained(model_path)
        tokenizers[name] = BertTokenizer.from_pretrained(model_path)

    print("All models loaded successfully!")

@router.get("/status")
def get_status():
    return {"message": "Models are loaded and ready!"}
