from fastapi import FastAPI, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

import pdfplumber
import spacy
import shutil
import os
import re

from docx import Document

from difflib import SequenceMatcher

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# CREATE UPLOADS FOLDER
# =========================

if not os.path.exists("uploads"):
    os.makedirs("uploads")

# =========================
# STATIC FILES
# =========================

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# =========================
# LOAD NLP MODEL
# =========================

try:
    nlp = spacy.load("en_core_web_sm")
except:
    nlp = spacy.blank("en")

# =========================
# DYNAMIC SKILLS
# =========================

def extract_dynamic_skills(text):

    text = text.lower()

    predefined_skills = [

        # JAVA
        "java",
        "spring",
        "spring boot",
        "hibernate",
        "jpa",
        "jdbc",
        "servlet",
        "jsp",
        "microservices",
        "rest api",
        "restful api",

        # DATABASE
        "mysql",
        "postgresql",
        "mongodb",
        "oracle",
        "sql",

        # DEVOPS
        "docker",
        "kubernetes",
        "jenkins",
        "git",
        "github",
        "maven",
        "gradle",
        "ci/cd",

        # PYTHON AI
        "python",
        "django",
        "flask",
        "fastapi",
        "machine learning",
        "deep learning",
        "tensorflow",
        "pytorch",
        "scikit learn",
        "nlp",
        "pandas",
        "numpy",
        "generative ai",
        "llm",
        "llms",
        "mlops",

        # CLOUD
        "aws",
        "azure",
        "gcp",
        "cloud",
        "cloud computing",

        # FRONTEND
        "react",
        "reactjs",
        "javascript",
        "typescript",
        "html",
        "css",
        "bootstrap",
        "tailwind",

        # UI UX
        "figma",
        "adobe xd",
        "wireframing",
        "prototyping",
        "user research",
        "responsive design"
    ]

    extracted_skills = []

    for skill in predefined_skills:

        if skill in text:
            extracted_skills.append(skill)

    # REMOVE DUPLICATES

    normalized_skills = []

    for skill in extracted_skills:

        if skill == "spring" and "spring boot" in extracted_skills:
            continue

        if skill == "sql" and "mysql" in extracted_skills:
            continue

        if skill == "reactjs" and "react" in extracted_skills:
            continue

        if skill == "restful api" and "rest api" in extracted_skills:
            continue

        if skill not in normalized_skills:
            normalized_skills.append(skill)

    return normalized_skills

# =========================
# DYNAMIC EDUCATION
# =========================

def extract_education(text):

    text = text.lower()

    education_patterns = {

        "MCA": [
            r"\bmca\b",
            r"master of computer applications"
        ],

        "BCA": [
            r"\bbca\b",
            r"bachelor of computer applications"
        ],

        "BTECH": [
            r"\bb\.?\s*tech\b",
            r"\bbtech\b",
            r"bachelor of technology"
        ],

        "BE": [
            r"\bb\.?\s*e\b",
            r"bachelor of engineering"
        ],

        "MTECH": [
            r"\bm\.?\s*tech\b",
            r"\bmtech\b",
            r"master of technology"
        ],

        "MBA": [
            r"\bmba\b",
            r"master of business administration"
        ],

        "BSC": [
            r"\bb\.?\s*sc\b",
            r"\bbsc\b",
            r"bachelor of science"
        ],

        "MSC": [
            r"\bm\.?\s*sc\b",
            r"\bmsc\b",
            r"master of science"
        ],

        "DIPLOMA": [
            r"\bdiploma\b"
        ]
    }

    detected_education = []

    for degree, patterns in education_patterns.items():

        for pattern in patterns:

            if re.search(pattern, text):
                detected_education.append(degree)
                break

    # =========================
    # REMOVE DUPLICATES
    # =========================

    detected_education = list(
        dict.fromkeys(detected_education)
    )

    # =========================
    # PRIORITY LOGIC
    # =========================

    # MCA > BCA

    if "MCA" in detected_education:

        if "BCA" in detected_education:
            detected_education.remove("BCA")

    # MTECH > BTECH + BE

    if "MTECH" in detected_education:

        if "BTECH" in detected_education:
            detected_education.remove("BTECH")

        if "BE" in detected_education:
            detected_education.remove("BE")

    # =========================
    # FINAL OUTPUT
    # =========================

    if len(detected_education) == 0:
        return "Not Found"

    return ", ".join(detected_education)

# =========================
# AI SKILL MATCH
# =========================

def skill_match(skill1, skill2):

    skill1 = skill1.lower()
    skill2 = skill2.lower()

    if skill1 == skill2:
        return True

    similarity = SequenceMatcher(
        None,
        skill1,
        skill2
    ).ratio()

    if similarity >= 0.75:
        return True

    doc1 = nlp(skill1)
    doc2 = nlp(skill2)

    semantic_score = doc1.similarity(doc2)

    if semantic_score >= 0.80:
        return True

    return False

# =========================
# HOME API
# =========================

@app.get("/")
def home():

    return {
        "message": "Python NLP Engine Running"
    }

# =========================
# ANALYZE RESUME
# =========================

@app.post("/analyze")
async def analyze_resume(

    file: UploadFile = File(...),

    job_description: str = Form(...),

    job_title: str = Form(...)
):

    temp_file = f"uploads/{file.filename}"

    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # =========================
    # EXTRACT TEXT
    # =========================

    text = ""

    filename = file.filename.lower()

    # PDF

    if filename.endswith(".pdf"):

        with pdfplumber.open(temp_file) as pdf:

            for page in pdf.pages:

                extracted = page.extract_text()

                if extracted:
                    text += extracted + "\n"

    # DOCX

    elif filename.endswith(".docx"):

        document = Document(temp_file)

        for para in document.paragraphs:
            text += para.text + "\n"

    else:

        return {
            "error": "Unsupported file type"
        }

    lower_text = text.lower()

    # =========================
    # NAME
    # =========================

    candidate_name = ""

    lines = text.split("\n")

    if len(lines) > 0:
        candidate_name = lines[0].strip()

    # =========================
    # EMAIL
    # =========================

    email = ""

    email_match = re.search(
        r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
        text
    )

    if email_match:
        email = email_match.group()

    # =========================
    # PHONE
    # =========================

    phone = ""

    phone_match = re.search(
        r'(\+91[\-\s]?)?[6-9]\d{9}\b',
        text
    )

    if phone_match:

        phone = phone_match.group()

        phone = re.sub(
            r'[\s\-]',
            '',
            phone
        )

        if not phone.startswith("+91"):
            phone = "+91" + phone

    # =========================
    # LOCATION
    # =========================

    location = ""

    location_keywords = [
        "chennai",
        "bangalore",
        "hyderabad",
        "mumbai",
        "delhi",
        "pune",
        "kolkata"
    ]

    for city in location_keywords:

        if city in lower_text:
            location = city.title()
            break

    # =========================
    # LINKEDIN
    # =========================

    linkedin = ""

    linkedin_match = re.search(
        r'linkedin\.com/in/[A-Za-z0-9_-]+',
        lower_text
    )

    if linkedin_match:
        linkedin = linkedin_match.group()

    # =========================
    # GITHUB
    # =========================

    github = ""

    github_match = re.search(
        r'github\.com/[A-Za-z0-9_-]+',
        lower_text
    )

    if github_match:
        github = github_match.group()

    # =========================
    # EDUCATION
    # =========================

    education = extract_education(lower_text)

    # =========================
    # EXPERIENCE
    # =========================

    experience = 0

    experience_patterns = [

        r'(\d+(?:\.\d+)?)\+?\s+years',
        r'(\d+)\+?\s+yrs',
        r'(\d+)\+?\s+year',
        r'(\d+)\+?\s+yr',
        r'experience\s*:\s*(\d+)'
    ]

    for pattern in experience_patterns:

        matches = re.findall(pattern, lower_text)

        for match in matches:

            years = float(match)

            if years <= 40:
                experience = max(experience, years)

    # =========================
    # PROJECTS
    # =========================

    projects = []

    project_keywords = [
        "resume screening system",
        "e-commerce",
        "chat application",
        "bank management system",
        "inventory system"
    ]

    for project in project_keywords:

        if project in lower_text:
            projects.append(project)

    # =========================
    # CERTIFICATIONS
    # =========================

    certifications = []

    certification_keywords = [
        "aws certified",
        "oracle certified",
        "java certification",
        "azure certification",
        "google cloud certification"
    ]

    for certification in certification_keywords:

        if certification in lower_text:
            certifications.append(certification)

    # =========================
    # TF-IDF SIMILARITY
    # =========================

    documents = [
        lower_text,
        job_description.lower()
    ]

    vectorizer = TfidfVectorizer(
        stop_words="english"
    )

    tfidf_matrix = vectorizer.fit_transform(documents)

    similarity = cosine_similarity(
        tfidf_matrix[0:1],
        tfidf_matrix[1:2]
    )

    similarity_score = round(
        float(similarity[0][0]) * 100,
        2
    )

    # =========================
    # SKILLS
    # =========================

    job_skills = extract_dynamic_skills(
        job_description
    )

    resume_skills = extract_dynamic_skills(
        lower_text
    )

    extracted_skills = []

    for jd_skill in job_skills:

        for resume_skill in resume_skills:

            if skill_match(
                jd_skill,
                resume_skill
            ):

                extracted_skills.append(jd_skill)
                break

    matched_skill_list = list(set(extracted_skills))

    # =========================
    # SKILL SCORE
    # =========================

    skill_percentage = 0

    if len(job_skills) > 0:

        skill_percentage = (
            len(matched_skill_list)
            / len(job_skills)
        ) * 100

    skill_percentage = round(
        skill_percentage,
        2
    )

    # =========================
    # EXPERIENCE SCORE
    # =========================

    if experience >= 5:
        experience_score = 100

    elif experience >= 3:
        experience_score = 85

    elif experience >= 1:
        experience_score = 70

    else:
        experience_score = 40

    # =========================
    # BONUS SCORE
    # =========================

    job_title_lower = job_title.lower()

    title_bonus = 0

    if "java developer" in job_title_lower:

        if "java" in lower_text:
            title_bonus = 15

    elif "python developer" in job_title_lower:

        if "python" in lower_text:
            title_bonus = 15

    elif "frontend developer" in job_title_lower:

        if "react" in lower_text or "javascript" in lower_text:
            title_bonus = 15

    elif "ui ux designer" in job_title_lower:

        if "figma" in lower_text or "adobe xd" in lower_text:
            title_bonus = 15

    elif "machine learning engineer" in job_title_lower:

        if "machine learning" in lower_text or "tensorflow" in lower_text:
            title_bonus = 15

    elif "devops engineer" in job_title_lower:

        if "docker" in lower_text or "kubernetes" in lower_text:
            title_bonus = 15

    # =========================
    # FINAL SCORE
    # =========================

    score = (
        skill_percentage * 0.7 +
        similarity_score * 0.2 +
        experience_score * 0.1 +
        title_bonus
    )

    score = round(score, 2)

    if score > 100:
        score = 100

    # =========================
    # RANK
    # =========================

    if score >= 80:
        rank = "Excellent"

    elif score >= 60:
        rank = "Good"

    elif score >= 40:
        rank = "Average"

    else:
        rank = "Low"

    # =========================
    # RESUME URL
    # =========================

    resumeUrl = (
        f"https://resume-screening-system-uhnn.onrender.com/uploads/{file.filename}"
    )

    print("=================================")
    print("JOB SKILLS:", job_skills)
    print("MATCHED SKILLS:", matched_skill_list)
    print("MATCHED SKILLS COUNT:", len(matched_skill_list))
    print("SKILL PERCENTAGE:", skill_percentage)
    print("FINAL SCORE:", score)
    print("=================================")

    # =========================
    # RESPONSE
    # =========================

    return {

        "name": candidate_name,
        "email": email,
        "phone": phone,
        "location": location,
        "linkedin": linkedin,
        "github": github,

        "education": education,

        "skills": resume_skills,

        "job_skills": job_skills,

        "matchedSkills": matched_skill_list,

        "matchedSkillsCount": len(matched_skill_list),

        "skill_match_percentage": skill_percentage,

        "similarity_score": similarity_score,

        "experience": int(experience),

        "experience_score": experience_score,

        "certifications": certifications,

        "projects": projects,

        "score": score,

        "rank": rank,

        "resumeUrl": resumeUrl
    }