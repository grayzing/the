import base64
from io import BytesIO

from PIL import Image


def convert_to_base64(pil_image):
    """
    Convert PIL images to Base64 encoded strings

    :param pil_image: PIL image
    :return: Re-sized Base64 string
    """

    buffered = BytesIO()
    pil_image.save(buffered, format="JPEG")  # You can change the format if needed
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str

def img_to_base64(file_path: str):
    pil_image = Image.open(file_path)
    buffered = BytesIO()
    
    pil_image.save(buffered, format="PNG")
    
    img_bytes = buffered.getvalue()
    base64_encoded = base64.b64encode(img_bytes)
    
    utf8_decoded = base64_encoded.decode('utf-8')
    img_url = f"{utf8_decoded}"
    return img_url
