<template>
    <card class="is-rounded log-show-card"
        v-if="log">
        <card-header class="log-show-header">
            <template #title>
                <p>
                    {{ i18n('The log file') }}
                    <code>{{ log.name }}</code>
                    {{ i18n('was last updated') }}
                    {{ log.modified ? timeFromNow(log.modified) : null }}
                    {{ i18n('ago') }}.
                    {{ i18n('Current file size is') }} {{ log.size }} {{ i18n('MB') }}
                </p>
            </template>
            <template #controls>
                <card-control>
                    <a class="icon is-small has-text-info"
                        :href="route('system.logs.download', log.name)">
                        <fa :icon="faCloudArrowDown"/>
                    </a>
                </card-control>
                <card-control>
                    <confirmation placement="bottom"
                        @confirm="empty(log)">
                        <span class="icon is-small has-text-danger">
                            <fa :icon="faTrashCan"/>
                        </span>
                    </confirmation>
                </card-control>
                <card-refresh @refresh="fetch()"/>
            </template>
        </card-header>
        <card-content class="p-0"
            :key="log.modified">
            <pre class="log"
                v-hljs>
                <code class="php">
{{ log.content || i18n('The log file is empty') }}
                </code>
            </pre>
        </card-content>
    </card>
</template>

<script>
import { FontAwesomeIcon as Fa } from '@fortawesome/vue-fontawesome';
import { faCloudArrowDown, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import {
    Card, CardHeader, CardRefresh, CardControl, CardContent,
} from '@enso-ui/card/bulma';
import Confirmation from '@enso-ui/confirmation/bulma';
import { hljs } from '@enso-ui/directives';
import formatDistance from '@enso-ui/ui/src/modules/plugins/date-fns/formatDistance';

export default {
    name: 'Show',

    directives: { hljs },

    components: {
        Card,
        CardHeader,
        CardRefresh,
        CardControl,
        CardContent,
        Confirmation,
        Fa,
    },

    inject: ['errorHandler', 'http', 'i18n', 'route', 'toastr'],

    data: () => ({
        faCloudArrowDown,
        faTrashCan,
        log: null,
        content: null,
    }),

    created() {
        this.fetch();
    },

    methods: {
        fetch() {
            this.http.get(this.route('system.logs.show', this.$route.params.log))
                .then(({ data }) => {
                    this.log = data;
                }).catch(this.errorHandler);
        },
        empty() {
            this.http.delete(this.route('system.logs.destroy', this.log.name)).then(({ data }) => {
                this.log = data.log;
                this.toastr.success(data.message);
            }).catch(this.errorHandler);
        },
        timeFromNow(date) {
            return formatDistance(date);
        },
    },
};
</script>

<style lang="scss">
    .log-show-header {
        color: var(--bulma-text);

        .card-header-title,
        .card-header-icon,
        .card-control,
        .icon {
            color: inherit;
        }

        .card-header-title {
            color: var(--bulma-text-strong);
        }

        code {
            background-color: var(--bulma-scheme-main-ter);
            border-radius: var(--bulma-radius-small);
            color: var(--bulma-primary);
            padding: 0.125rem 0.375rem;
        }
    }

    pre.log {
        background-color: var(--bulma-scheme-main-bis) !important;
        color: var(--bulma-text);
        margin: 0;
        min-height: 18rem;
        padding: 1rem 1.25rem;
    }

    pre.log code {
        background: transparent !important;
        color: inherit !important;
        display: block;
        min-height: inherit;
        white-space: pre-wrap;
        word-break: break-word;
    }

    .hljs {
        background: transparent !important;
        color: var(--bulma-text) !important;
        display: block;
        min-height: inherit;
    }

    .hljs-comment,
    .hljs-quote {
        color: color-mix(in srgb, var(--bulma-text-light) 85%, #7a8699);
    }

    .hljs-keyword,
    .hljs-selector-tag,
    .hljs-subst {
        color: #ff9f6e;
    }

    .hljs-string,
    .hljs-attribute,
    .hljs-template-tag,
    .hljs-template-variable {
        color: #8ddc97;
    }

    .hljs-number,
    .hljs-literal,
    .hljs-variable,
    .hljs-tag .hljs-attr {
        color: #73c8ff;
    }

    .hljs-title,
    .hljs-section,
    .hljs-selector-id {
        color: #ffd166;
    }

    .hljs-built_in,
    .hljs-type,
    .hljs-symbol,
    .hljs-bullet {
        color: #95e1d3;
    }

    .hljs-meta,
    .hljs-deletion {
        color: #f28482;
    }

    .hljs-addition {
        color: #84dcc6;
    }
</style>
