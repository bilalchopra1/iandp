import sys
from transformers import pipeline
import torch

def generate_caption(image_path):
    """
    Generates a caption for a given image using a local transformer model.
    """
    try:
        # Check for GPU availability
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Initialize the image-to-text pipeline
        # Using "blip-image-captioning-base" as it's smaller and faster for local inference
        captioner = pipeline("image-to-text", model="Salesforce/blip-image-captioning-base", device=device)
        
        # Generate caption
        result = captioner(image_path)
        
        # The output is a list of dictionaries, e.g., [{'generated_text': '...'}]
        if result and len(result) > 0 and 'generated_text' in result[0]:
            print(result[0]['generated_text'])
        
    except Exception as e:
        print(f"Error during model inference: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_caption.py <path_to_image>", file=sys.stderr)
        sys.exit(1)
    
    image_path = sys.argv[1]
    generate_caption(image_path)