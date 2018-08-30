<template>
    <div class="corpus-text-creator__container">
        <div class="corpus-text-creator__textinfo flex-group-sb mt6 mb6">
            <div class="w45 flex-group-sb">
                <div class="text-2xl secondary">Textinformationen</div>
            </div>
            <div class="form-group-50 w45 flex-group-sb">
                <label for="corpus-text-creator__input-author">Autor:</label>
                <input type="text" id="corpus-text-creator__input-author" v-model="this.textdata.author">
            </div>
            <div class="form-group-50 w45 flex-group-sb">
                <label for="corpus-text-creator__input-title">Titel des Textes:</label>
                <input type="text" id="corpus-text-creator__input-title" v-model="this.textdata.title">
            </div>
            <div class="form-group-50 w45 flex-group-sb">
                <label for="corpus-text-creator__input-subtitle">Untertitel:</label>
                <input type="text" id="corpus-text-creator__input-subtitle" v-model="this.textdata.subtitle">
            </div>
            <div class="form-group-50 w45 flex-group-sb">
                <label for="corpus-text-creator__input-locus">Textstelle:</label>
                <input type="text" id="corpus-text-creator__input-locus" v-model="this.textdata.locus">
            </div>
            <div class="form-group-50 w45 flex-group-sb">
                <label for="corpus-text-creator__input-source">Textquelle:</label>
                <input type="text" id="corpus-text-creator__input-source" v-model="this.textdata.source">
            </div>
        </div>
        <div v-show="this.step === 1" class="corpus-text-creator__step1">
            <corpus-library :corpus="corpus"></corpus-library>
        </div>
        <div v-show="this.step === 2" class="corpus-text-creator__step2">
            <div class="pt6">
                <loading-dots :color="'red'"></loading-dots>
                <div class="text-center secondary italic p2">Text wird geladen ...</div>
            </div>
        </div>
        <div v-show="this.step === 3" class="corpus-text-creator__step3 flex-group-sb">
            <div class="corpus-text-creator__text-extractor" v-if="selected_text">
                <corpus-text-extractor :corpustext="selected_text"></corpus-text-extractor>
            </div>
        </div>
    </div>
</template>

<script>
    import CorpusLibrary from '../corpus-library/CorpusLibrary'
    import CorpusTextEctractor from './CorpusTextExtractor'
    import LoadingDots from "../loader/LoadingDots";

    export default {
        name: "corpus-text-creator",
        props: ['corpus'],
        data: function () {
            return {
                'step': 1,
                'selected_text': null,
                'textdata': {
                    'author': '',
                    'title': '',
                    'subtitle': '',
                    'locus': '',
                    'source': '',
                    'shared': false,
                },
            }
        },
        methods: {
            nextStep () {
                this.step++;
            },
            previousStep () {
                this.step--;
            },
        },
        components: {
            'corpus-library': CorpusLibrary,
            'corpus-text-extractor': CorpusTextEctractor,
            'loading-dots': LoadingDots,
        },
        mounted: function () {
            EventBus.$on('textcorpus_textselected', (text) => {
                this.textdata.author = text.autor;
                this.textdata.title = text.titel;
                this.textdata.source = text.source;
                this.nextStep();
                axios.post('/texte/corpus/load', {
                    'phi_id': text.phi_id,
                })
                     .then((response) => {
                         this.selected_text = response.data;
                         this.nextStep();
                     });
            })
        }
    }
</script>

<style scoped>
    .corpus-text-creator__container {
        padding: 1.5rem;
    }

    .corpus-text-creator__textinfo {
        flex-wrap: wrap;
    }

    .corpus-text-creator__textinfo label {
        width: 30%;
        font-style: italic;
        padding-top: 0.25rem;
    }

    .corpus-text-creator__textinfo input {
        width: 65%;
        border-top: 0;
        border-right: 0;
        border-left: 0;
        padding: 0.25rem;
        border-bottom: 1px solid #aaa;

    }
</style>