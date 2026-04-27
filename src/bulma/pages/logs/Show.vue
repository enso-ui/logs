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
                    <confirmation class="is-flex is-align-items-center"
                        placement="bottom"
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
            <log :content="log.content"/>
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
import formatDistance from '@enso-ui/ui/src/modules/plugins/date-fns/formatDistance';
import Log from './components/Log.vue';

export default {
    name: 'Show',

    components: {
        Card,
        CardHeader,
        CardRefresh,
        CardControl,
        CardContent,
        Confirmation,
        Fa,
        Log,
    },

    inject: ['errorHandler', 'http', 'i18n', 'route', 'toastr'],

    data: () => ({
        faCloudArrowDown,
        faTrashCan,
        log: null,
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
