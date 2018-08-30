<template>
    <div class="text-creator__container box-shadow-gentle">
        <div class="text-creator__type--button-container flex-group-sb ">
            <button class="text-creator__type--button italic" v-bind:class="{'active': this.type==='user', 'white': this.type===''}" @click="type='user'">Eigener Text</button>
            <button class="text-creator__type--button italic" v-bind:class="{'active': this.type==='corpus', 'white': this.type===''}" @click="type='corpus'">Textcorpus</button>
        </div>
        <div class="text-creator__components-container">

            <user-text-creator v-show="this.type === 'user'" :type="type"></user-text-creator>
            <corpus-text-creator v-show="this.type === 'corpus'" :corpus="corpus"></corpus-text-creator>
        </div>
    </div>
</template>

<script>
    import UserTextCreator from './UserTextCreator';
    import CorpusTextCreator from './CorpusTextCreator';

    export default {
        name: "text-creator",
        props: ['corpus'],
        data: function () {
            return {
                'type': '',

            }
        },
        methods:
            {},
        components: {
            'user-text-creator': UserTextCreator,
            'corpus-text-creator': CorpusTextCreator
        }
    }
</script>

<style scoped>


    .text-creator__container {
        width: 100%;
        margin: 1rem 0;
    }

    .text-creator__type--button-container {
    }

    .text-creator__type--button.active {
        background: #eee;
        color: #B22E2F;
        border-top: 3px solid #B22E2F;
    }

    .text-creator__type--button.white {
        background: #fff;
    }

    .text-creator__type--button.white:hover {
        color: #B22E2F;
    }

    .text-creator__type--button {
        width: 50%;
        background: #ddd;
        border-top: 3px solid #aaa;
        color: #aaa;
        font-size: 1.5rem;
        padding: 0.5rem 0.5rem 0.75rem 0.5rem;

    }

    .text-creator__components-container {
        display: block;
        height: auto;
        background: #eee;
    }
</style>