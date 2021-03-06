import { mapGetters } from 'vuex'
export default {
    name: 'quize-box',
    data() {
        return {
            choosed: {},
            currentQuestion: {},
            currentId: null,
            questionsArr: [],
            answersArr: [],
            myResults: [],
            totalPointes: 0,
            prevBtnDisabled: false,
            nextBtnDisabled: false,
        }
    },
    methods: {
        radioChoosed(answer, number) {
            let answerObj = {
                number: number,
                answer: answer
            }
            //handle if user changed stored answer
            let storedAnswersNubmer = []
            for (let storedAnswer of this.answersArr) {
                if (storedAnswer.number === answerObj.number) {
                    storedAnswer.answer = answerObj.answer
                }
                storedAnswersNubmer.push(storedAnswer.number)
            }
            // store new answer
            if (storedAnswersNubmer.indexOf(answerObj.number) == -1) {
                this.answersArr.push(answerObj)
            }
        },
        nextBtn() {
            let questionId = this.$route.params.id
            if (questionId > 0 && questionId <= this.questionsArr.length - 1) {
                questionId++
                for (let question of this.questionsArr) {
                    if (question.id == questionId) {
                        this.$store.commit('setnextQuestion', { nextQuestion: question });
                        this.$store.commit('setCurrentQuestionId', { currentQuestionId: questionId });
                    }
                }
                //handle duplicated route
                if (this.$route.params.id == questionId) {
                    questionId++
                    this.$router.push({ name: 'question', params: { id: questionId } })
                } else {
                    this.$router.push({ name: 'question', params: { id: questionId } })
                }
                if (questionId == this.questionsArr.length) {
                    this.$store.commit('setQuizStatue', { isFinished: true });
                }
            }
        },
        prevBtn() {
            let questionId = this.$route.params.id
            if (questionId > 1 && questionId <= this.questionsArr.length) {
                questionId--
                for (let question of this.questionsArr) {
                    if (question.id == questionId) {
                        this.$store.commit('setnextQuestion', { nextQuestion: question });
                        this.$store.commit('setCurrentQuestionId', { currentQuestionId: questionId });
                    }
                }
                this.$router.push({ name: 'question', params: { id: questionId } })
            }
        },
        resultBtn() {
            this.$store.commit('setQuestionAnswer', { questionAnswer: this.answersArr });
            this.$store.commit('setQuizStatue', { isFinished: true });

            //commit result
            for (let rowInfo of this.questionsArr) {
                if (this.answersArr[rowInfo.id - 1]) {
                    this.myResults.push({
                        'The_Question': rowInfo.question,
                        'Correct_Answer': rowInfo.correct_answer,
                        'Your_Answer': !this.answersArr[rowInfo.id - 1] ? "no Answer" : this.answersArr[rowInfo.id - 1].answer,
                        'Points': this.answersArr[rowInfo.id - 1].answer == rowInfo.correct_answer ? 1 : 0,
                        'isCorrect': this.answersArr[rowInfo.id - 1].answer == rowInfo.correct_answer ? true : false,
                    })
                    this.answersArr[rowInfo.id - 1].answer == rowInfo.correct_answer ? this.totalPointes++ : this.totalPointes + 0
                }
            }
            this.$store.commit('setResults', { userResults: this.myResults, score: this.totalPointes });
            this.$router.push({ name: 'result' })
        }
    },
    computed: {
        //get current question
        ...mapGetters(['getnextQuestion']),
    },
    mounted() {
        this.currentId = this.$route.params.id
        this.questionsArr = this.$store.getters.getQuestions
        for (let question of this.questionsArr) {
            if (question.id == this.currentId) {
                this.$store.commit('setnextQuestion', { nextQuestion: question });
                this.currentQuestion = this.$store.getters.getnextQuestion
            }
        }

        // if no object or reloading route to home page
        if (!this.currentQuestion.id) {
            window.onload = this.$router.push({ name: 'Home' })
            console.log(this.currentQuestion);
        }
    },
    beforeUpdate() {
        //handle duplicated values
        this.choosed.answer = ''
        let questionId = this.$route.params.id

        //handle disable next button
        if (questionId == this.questionsArr.length) {
            this.nextBtnDisabled = true
        } else {
            this.nextBtnDisabled = false
        }

        //handle disable prev button
        if (questionId == 1) {
            this.prevBtnDisabled = true
        } else {
            this.prevBtnDisabled = false
        }
        //get stored answer if there is
        if (this.answersArr[questionId - 1]) {
            this.choosed.answer = this.answersArr[questionId - 1].answer
        }
    },

}