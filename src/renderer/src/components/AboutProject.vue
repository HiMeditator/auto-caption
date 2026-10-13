<template>
  <a-modal v-model:open="open" :title="$t('status.about.title')" :footer="null" :width="680" centered>
    <div class="about-content" :style="aboutStyle">
      <header class="about-header">
        <div class="about-logo" aria-hidden="true"><img :src="appIcon" alt="" /></div>
        <h2 class="about-title">Auto Caption</h2>
        <p class="about-desc">{{ $t('status.about.desc') }}</p>
      </header>

      <dl class="about-release">
        <div>
          <dt>{{ $t('status.about.version') }}</dt>
          <dd><a-tag class="about-version" color="success">v{{ version }}</a-tag></dd>
        </div>
        <div>
          <dt>{{ $t('status.about.updateDate') }}</dt>
          <dd><time datetime="2026-10-14">{{ $t('status.about.date') }}</time></dd>
        </div>
      </dl>

      <nav class="about-links" :aria-label="$t('status.about.title')">
        <a
          v-for="link in links"
          :key="link.title"
          class="about-link"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="about-link-heading">
            <span class="about-link-icon" aria-hidden="true"><component :is="link.icon" /></span>
            <span class="about-link-title">{{ $t(link.title) }}</span>
            <ArrowUpOutlined class="about-link-arrow" aria-hidden="true" />
          </span>
          <span class="about-link-desc">{{ $t(link.description) }}</span>
          <span class="about-link-url">{{ link.href }}</span>
        </a>
      </nav>

      <footer class="about-footer">
        <span>{{ $t('status.about.author') }}</span>
        <span class="about-author">HiMeditator</span>
      </footer>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { theme } from 'ant-design-vue'
import {
  ArrowUpOutlined,
  BookOutlined,
  CodeOutlined,
  GithubOutlined,
  HistoryOutlined
} from '@ant-design/icons-vue'
import { version } from '../../../../package.json'
import appIcon from '../../../../build/icon.png'

const open = defineModel<boolean>('open', { default: false })
const { t } = useI18n()
const { token } = theme.useToken()
const aboutStyle = computed(() => ({
  '--about-text': token.value.colorText,
  '--about-heading': token.value.colorTextHeading,
  '--about-secondary': token.value.colorTextSecondary,
  '--about-border': token.value.colorBorderSecondary,
  '--about-background': token.value.colorFillAlter,
  '--about-primary': token.value.colorPrimary
}))
const links = computed(() => [
  {
    title: 'status.about.projLink',
    description: 'status.about.projLinkDesc',
    href: 'https://github.com/HiMeditator/auto-caption',
    icon: GithubOutlined
  },
  {
    title: 'status.about.manual',
    description: 'status.about.manualDesc',
    href: `https://github.com/HiMeditator/auto-caption/blob/main/docs/user-manual/${t('lang')}.md`,
    icon: BookOutlined
  },
  {
    title: 'status.about.engineDoc',
    description: 'status.about.engineDocDesc',
    href: `https://github.com/HiMeditator/auto-caption/blob/main/docs/engine-manual/${t('lang')}.md`,
    icon: CodeOutlined
  },
  {
    title: 'status.about.changelog',
    description: 'status.about.changelogDesc',
    href: 'https://github.com/HiMeditator/auto-caption/blob/main/docs/CHANGELOG.md',
    icon: HistoryOutlined
  }
])
</script>

<style scoped>
.about-content {
  padding-top: 12px;
  color: var(--about-text);
}

.about-header {
  text-align: center;
}

.about-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  border: 1px solid var(--about-border);
  border-radius: 20px;
  background: var(--about-background);
}

.about-logo img {
  display: block;
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.about-title {
  margin: 0 0 8px;
  color: var(--about-heading);
  font-size: 28px;
  font-weight: 650;
  letter-spacing: -0.5px;
}

.about-desc {
  max-width: 400px;
  margin: 0 auto;
  color: var(--about-secondary);
  line-height: 1.7;
}

.about-release {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 24px 0;
  padding: 16px;
  border: 1px solid var(--about-border);
  border-radius: 12px;
  background: var(--about-background);
  text-align: center;
}

.about-release dt {
  margin-bottom: 8px;
  color: var(--about-secondary);
  font-size: 12px;
}

.about-release dd {
  margin: 0;
  font-weight: 500;
}

.about-version {
  margin: 0;
}

.about-links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  gap: 12px;
}

.about-link {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 8px;
  padding: 16px;
  border: 1px solid var(--about-border);
  border-radius: 12px;
  color: var(--about-text);
  transition: background-color 0.2s, border-color 0.2s;
}

.about-link:hover {
  border-color: var(--about-primary);
  background: var(--about-background);
  color: var(--about-text);
}

.about-link:focus-visible {
  outline: 2px solid var(--about-primary);
  outline-offset: 3px;
}

.about-link-icon {
  flex-shrink: 0;
  font-size: 22px;
}

.about-link-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.about-link-title {
  flex: 1;
  min-width: 0;
  font-weight: 500;
  overflow-wrap: anywhere;
}

.about-link-desc {
  color: var(--about-secondary);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.about-link-arrow {
  flex-shrink: 0;
  color: var(--about-secondary);
  transform: rotate(45deg);
}

.about-link-url {
  margin-top: auto;
  color: var(--about-secondary);
  font-size: 11px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.about-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--about-border);
  color: var(--about-secondary);
  font-size: 12px;
}

.about-author {
  color: var(--about-text);
}

@media (max-width: 420px) {
  .about-release {
    grid-template-columns: 1fr;
  }

  .about-link {
    padding: 12px;
  }

  .about-link-heading {
    gap: 6px;
  }
}
</style>
