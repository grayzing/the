"""
Written by Gray

This module uses agentic AI (Gemma 4 + LangChain) to decide if a given page is on-task.
Specifically, it requires a screenshot, page URL, and the given objectives, and integrates with
tooling to determine whether to boot the user to a previous, more relevant page.
"""
from langchain.messages import HumanMessage
from langchain_ollama import ChatOllama
from langchain_core.output_parsers import StrOutputParser

import image_part

llm = ChatOllama(model="gemma4:e4b", temperature=0)

def prompt_func(data):
    text = data["text"]
    image = data["image"]

    image_part = {
        "type": "image_url",
        "image_url": f"data:image/jpeg;base64,{image}",
    }

    content_parts = []

    text_part = {"type": "text", "text": text}

    content_parts.append(image_part)
    content_parts.append(text_part)

    return [HumanMessage(content=content_parts)]

def webpage_classify(img_path: str, objective: str) -> bool:
    """
    Determine if the screenshot of the webpage located at img_path is related to the objective
    """
    image_b64 = image_part.img_to_base64(img_path)
    chain = prompt_func | llm | StrOutputParser()

    query_chain = chain.invoke(
        {"text": f"""
         You are a teacher deeply invested in this user's education.
         As such, you would like them to be on task to their objective.
         Your task is to determine whether the provided screenshot is relevant to their objective.
         Is this webpage relevant to {objective}? If it is relevant, reply true. If it is not, reply false.
         """, "image": image_b64}
    )
    return query_chain.lower().strip() == "true"
