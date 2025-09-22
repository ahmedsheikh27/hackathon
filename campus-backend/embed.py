from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings 
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Load your PDF
loader = PyPDFLoader("converted_text.pdf")
documents = loader.load_and_split()

# Setup a local embedding model using the correct model name
# This will download the model to your local machine the first time you run it
embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/multi-qa-distilbert-cos-v1") 

# Create and save vectorstore
vectorstore = FAISS.from_documents(documents, embedding)
vectorstore.save_local("orca_vectorstore")

print("Vectorstore created and saved to disk.")
