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

llm = ChatOllama(model="gemma4:e2b", temperature=0)

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

def webpage_classify(img_path: str, objective: str) -> str:
    """
    Determine if the screenshot of the webpage located at img_path is related to the objective
    """
    supporting_prompt = f"""
         You are a teacher deeply invested in this user's education.
         As such, you would like them to be on task to their objective.
         Your task is to determine whether the provided screenshot is relevant to their objective.
         Is this webpage relevant to {objective}? If it is relevant, reply true. 
         If the webpage is MAYBE related to the objective, reply mismatch
         If it is not at all related to the objective, reply false.
         """
    image_b64 = image_part.img_to_base64(img_path)
    chain = prompt_func | llm | StrOutputParser()

    query_chain = chain.invoke(
        {"text": supporting_prompt, "image": image_b64}
    )
    result = query_chain.lower().strip()
    while not result in ["true", "mismatch", "false"]: # Handle cases where the LLM outputs the wrong answer
        result = query_chain.lower().strip()
    return result
