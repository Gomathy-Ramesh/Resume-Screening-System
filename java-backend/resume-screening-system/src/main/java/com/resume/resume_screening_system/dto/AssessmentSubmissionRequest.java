package com.resume.resume_screening_system.dto;

import java.util.List;

public class AssessmentSubmissionRequest {

    private List<AnswerRequest> answers;

    public AssessmentSubmissionRequest() {
    }

    public List<AnswerRequest> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerRequest> answers) {
        this.answers = answers;
    }

    public static class AnswerRequest {

        private Long questionId;
        private String answer;

        public AnswerRequest() {
        }

        public Long getQuestionId() {
            return questionId;
        }

        public void setQuestionId(Long questionId) {
            this.questionId = questionId;
        }

        public String getAnswer() {
            return answer;
        }

        public void setAnswer(String answer) {
            this.answer = answer;
        }
    }
}