<template>
    <div class="user-text-creator__container">
        <!-- STEP 1 -->
        <div v-show="this.step === 1" class="user-text-creator__container--step1">
            <div class="form-group-150">
                <label for="user-text-creator__input-author" class="user-text-creator__label mb1 text-xl italic ">Autor</label>
                <input class="user-text-creator__input text-xl" :class="{'hasError': this.errors.author}" id="user-text-creator__input-author" type="text" v-model="textdata.author">
            </div>
            <div class="form-group-150">
                <label for="user-text-creator__input-title" class="user-text-creator__label mb1 text-xl italic ">Titel</label>
                <input v-bind:class="{hasError: errors.title }" class="user-text-creator__input text-xl" id="user-text-creator__input-title" type="text" v-model="textdata.title">
            </div>
            <div class="form-group-150">
                <label for="user-text-creator__input-title" class="user-text-creator__label mb1 text-xl italic ">Untertitel</label>
                <input class="user-text-creator__input text-xl" :class="{'hasError': this.errors.subtitle}" id="user-text-creator__input-subtitle" type="text" v-model="textdata.subtitle">
            </div>
            <div class="form-group-150">
                <label for="user-text-creator__input-locus" class="user-text-creator__label mb1 text-xl italic ">Textstelle</label>
                <input class="user-text-creator__input text-xl" :class="{'hasError': this.errors.locus}" id="user-text-creator__input-locus" type="text" v-model="textdata.locus">
            </div>
            <div class="form-group-150">
                <label for="user-text-creator__input-locus" class="user-text-creator__label mb1 text-xl italic ">Quelle</label>
                <input class="user-text-creator__input text-xl" :class="{'hasError': this.errors.source}" id="user-text-creator__input-source" type="text" v-model="textdata.source">
            </div>
            <div class="form-group-150">
                <label for="user-text-creator__input-locus" class="user-text-creator__label mb1 text-xl italic ">Text ist
                    <span v-show="textdata.shared === false">nur für mich</span>
                    <span v-show="textdata.shared === true">öffentlich</span>
                    sichtbar
                </label>
                <div class="flex-group-start blue-red-switch__container">
                    <i class="fa fa-lock mr1"></i>
                    <div class="blue-red-switch">
                        <input
                                v-model="textdata.shared"
                                type="checkbox"
                                name="blue-red-switch"
                                id="user-text-creator__input-shared"
                                class="blue-red-switch-checkbox">
                        <label class="blue-red-switch-label" for="user-text-creator__input-shared">
                            <span class="blue-red-switch-inner"></span>
                            <span class="blue-red-switch-switch"></span>
                        </label>
                    </div>
                    <i class="fa fa-unlock ml1"></i>
                </div>
            </div>
            <div class="flex-group-end">
                <button @click="validateAndNextStep()" class="user-text-creator__button text-xl">Nächster Schritt</button>
            </div>
        </div>
        <!-- STEP 2 -->
        <div v-show="this.step === 2" class="user-text-creator__container--step2">
            <div class="form-group-150">
                <label for="user-text-creator__input-user-text" class="user-text-creator__label mb1 text-xl italic ">Text:</label>
                <textarea class="user-text-creator__input text-xl" :class="{'hasError': this.errors.user_text}" id="user-text-creator__input-user-text" v-model="textdata.user_text">
                </textarea>
            </div>

            <div class="flex-group-sb">

                <button @click="previousStep" class="user-text-creator__button text-xl">Vorheriger Schritt</button>
                <button @click="validateAndNextStep()" class="user-text-creator__button text-xl">Nächster Schritt</button>

            </div>
        </div>
        <!-- STEP 3 -->
        <div v-show="this.step === 3" class="user-text-creator__container--step3">
            Vorschau
            <div class="user-text-creator__control mb6 mt2">
                <div class="flex-group-start">
                    <span class="text-xl italic light-grey " v-html="textdata.author"></span>
                    <span class="text-xl italic light-grey " v-html="textdata.locus"></span>
                </div>
                <div class="flex-group-sb">
                    <span class="text-3xl italic  light-grey mb2" v-html="textdata.title"></span>
                </div>
                <div class="flex-group-start light-grey  mb4">
                    <span v-show="textdata.shared === false"><i class="fa fa-lock mr1"></i> Nur für mich sichtbar</span>
                    <span v-show="textdata.shared === true"><i class="fa fa-unlock mr1"></i> Öffentlich sichtbar</span>
                </div>
                <textarea class="user-text-creator__input text-xl" id="user-text-creator__input-user-text--control" v-model="textdata.user_text" disabled>
                </textarea>
            </div>

            <div class="flex-group-sb">
                <button @click="previousStep" class="user-text-creator__button text-xl">Vorheriger Schritt</button>
                <button @click="submitBaseInfoAndNextStep()" class="user-text-creator__button text-xl">Abschicken</button>
            </div>
        </div>
        <!-- STEP 4 -->
        <div v-show="this.step === 4" class="user-text-creator__container--step4">
            <div v-if="transformed_text">
                <div class="user-text-creator__control mb6 mt2">
                    <div id="user-text-creator__input-transformed-text--preview">
                        <pre v-text="transformed_text.xml"></pre>
                    </div>
                </div>

            </div>
            <div v-else class="p8">
                <loading-dots :color="'red'" class="mt6"></loading-dots>
                <br><br>
                <span class="block w100 text-center">Text wird verarbeitet ...</span>

            </div>
        </div>
    </div>
</template>

<script>
    import LoadingDots from "../loader/LoadingDots";


    export default {
        name: "user-text-creator",
        components: {
            'loading-dots': LoadingDots
        },
        data: function () {
            return {
                'step': 1,
                'transformed_text': false,
                'errors': {
                    'author': false,
                    'title': false,
                    'subtitle': false,
                    'locus': false,
                    'source': false,
                    'shared': false,
                    'user_text': false,
                },
                'textdata': {
                    'author': '',
                    'title': '',
                    'subtitle': '',
                    'locus': '',
                    'source': '',
                    'shared': false,
                    'user_text': '',
                },
            }
        }, methods: {
            nextStep () {
                this.step++;
            },
            previousStep () {
                this.step--;
            },
            async getRequestObject () {
                if (this.step === 1) {
                    return {
                        author: this.textdata.author,
                        title: this.textdata.title,
                        subtitle: this.textdata.subtitle,
                        locus: this.textdata.locus,
                        source: this.textdata.source,
                        shared: this.textdata.shared,
                    }

                } else {
                    return {
                        author: this.textdata.author,
                        title: this.textdata.title,
                        subtitle: this.textdata.subtitle,
                        locus: this.textdata.locus,
                        source: this.textdata.source,
                        shared: this.textdata.shared,
                        user_text: this.textdata.user_text
                    }
                }
            },
            async validateAndNextStep () {
                axios.post('/texte/validate-user-input', await this.getRequestObject())
                     .then((response) => {
                         // Set all errors to false
                         Object.keys(this.errors).forEach(v => this.errors[v] = false);
                         // Proceed to next step
                         this.nextStep();

                     }).catch((error) => {
                    // reactive errors-property to true for error-input-field
                    for (let property in error.response.data.errors) {
                        this.errors[property] = true;
                    }
                })
            },
            async submitBaseInfoAndNextStep () {
                this.nextStep();
                axios.post('/texte/store', await this.getRequestObject())
                     .then((response) => {
                         this.transformed_text = response.data;
                     })
            }
        },

    }
</script>

<style scoped>


    .user-text-creator__container {
        padding: 1.5rem;
    }

    .user-text-creator__input {
        width: 100%;
        height: 2.5rem;
        padding: 0.5rem;
        background: #fff;
        border: none;
    }

    .user-text-creator__input.hasError, #user-text-creator__input-user-text.hasError {
        border: 1px solid #B22E2F;
    }

    .user-text-creator__submit, .user-text-creator__button {
        padding: 0.5rem;
        margin-top: 0.5rem;
        width: 49%;
    }

    .user-text-creator__submit:hover {
        background: #721E1E;
    }

    .user-text-creator__control {
        padding: 1rem;
        background: #fff;
        color: #333;
        border: 1px dashed #999;

    }

    #user-text-creator__input-user-text--control, #user-text-creator__input-transformed-text--preview {
        resize: none;
        outline: none;
    }

    #user-text-creator__input-user-text--control {
        border: none;
        font-family: Merriweather;
        height: 20rem;
    }

    #user-text-creator__input-transformed-text--preview pre {
        border: none;
        font-family: monospace, 'Merriweather Sans';
        font-size: 0.8rem;
        color: #BC7330;
    }

    #user-text-creator__input-user-text {
        height: 20rem;
        font-family: Merriweather;
        border: 1px solid #ccc;
    }

</style>