<template>
    <pre class="log"><code class="log-content"><template
        v-for="(line, lineIndex) in highlightedLines"
        :key="lineIndex"><template
            v-for="(segment, segmentIndex) in line"
            :key="segmentIndex"><span
                v-if="segment.class"
                :class="segment.class">{{ segment.text }}</span><template
                v-else>{{ segment.text }}</template></template><br
            v-if="lineIndex < highlightedLines.length - 1"></template></code>
    </pre>
</template>

<script setup>
import { computed, inject } from 'vue';

const levelClasses = {
    EMERGENCY: 'emergency',
    ALERT: 'alert',
    CRITICAL: 'critical',
    ERROR: 'error',
    WARNING: 'warning',
    WARN: 'warning',
    NOTICE: 'notice',
    INFO: 'info',
    DEBUG: 'debug',
};

const logHeader = /^(\[[^\]]+\])(\s+)([A-Za-z0-9_-]+)(\.)([A-Z]+)(:?)(.*)$/u;
const token = /(#\d+|\b(?:EMERGENCY|ALERT|CRITICAL|ERROR|WARNING|WARN|NOTICE|INFO|DEBUG)\b|[A-Za-z_][\w\\]*(?:Exception|Error|Throwable)|(?:\/[^\s:]+)+(?::\d+)?|\b\d+\b)/gu;

const segment = (text, type = null) => ({ text, class: type ? `log-token is-${type}` : null });

const props = defineProps({
    content: {
        type: String,
        default: null,
    },
});

const i18n = inject('i18n');

const tokenType = value => {
    if (levelClasses[value]) {
        return levelClasses[value];
    }

    if (value.startsWith('#')) {
        return 'stack';
    }

    if (value.startsWith('/')) {
        return 'path';
    }

    if (/(?:Exception|Error|Throwable)$/u.test(value)) {
        return 'exception';
    }

    return 'number';
};

const highlightTokens = line => {
    const segments = [];
    let offset = 0;

    line.replace(token, (match, value, index) => {
        if (index > offset) {
            segments.push(segment(line.slice(offset, index)));
        }

        segments.push(segment(value, tokenType(value)));
        offset = index + value.length;

        return match;
    });

    if (offset < line.length || segments.length === 0) {
        segments.push(segment(line.slice(offset)));
    }

    return segments;
};

const highlightLine = line => {
    const match = line.match(logHeader);

    if (!match) {
        return highlightTokens(line);
    }

    const [, date, whitespace, channel, dot, level, colon, message] = match;

    return [
        segment(date, 'date'),
        segment(whitespace),
        segment(channel, 'channel'),
        segment(dot),
        segment(level, levelClasses[level] || 'level'),
        segment(colon),
        ...highlightTokens(message),
    ];
};

const highlightedLines = computed(() => {
    const content = props.content || i18n('The log file is empty');

    return content.split('\n').map(highlightLine);
});
</script>

<style lang="scss">
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

    .log-token {
        &.is-date,
        &.is-channel,
        &.is-stack {
            color: color-mix(in srgb, var(--bulma-text-light) 85%, #7a8699);
        }

        &.is-emergency,
        &.is-alert,
        &.is-critical,
        &.is-error,
        &.is-exception {
            color: #f28482;
            font-weight: var(--bulma-weight-semibold);
        }

        &.is-warning {
            color: #ffd166;
            font-weight: var(--bulma-weight-semibold);
        }

        &.is-notice,
        &.is-info {
            color: #73c8ff;
        }

        &.is-debug,
        &.is-number {
            color: #95e1d3;
        }

        &.is-path {
            color: #8ddc97;
        }
    }
</style>
