<script setup lang="ts">
import type { Link } from "@/lib/Link"
import { fetchLinksForDate } from '@/lib/links'
import { onBeforeMount, reactive } from 'vue';

const dates = Array.from({ length: 14 }, (_, n) => {
  const dayN = new Date();
  dayN.setDate(dayN.getDate() - n)

  return dayN
})

type DailyArchive = {
  date: string,
  sortKey: Date,
  links: Link[]
}

type State = {
  dailyArchive: DailyArchive[],
  isLoading: boolean
}

const state : State = reactive({
  dailyArchive: [],
  isLoading: true
})

onBeforeMount(() => {
  dates.forEach(async (day) => {
    const map = new Map<string, Link[]>();

    (await fetchLinksForDate(day)).forEach((item) => {
      const key = item.posted.toLocaleDateString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
      })
      const collection = map.get(key)

      if (!collection) {
        map.set(key, [item])
      } else {
        collection.push(item)
      }
    })

    map.forEach((links, key) => {
      state.dailyArchive.push({
        date: key,
        sortKey: links[0].posted,
        links
      })
    })

    window.setTimeout(() => {
      state.isLoading = false
    }, 250)

  })

})

function getDomainForURL(urlString: string) : string {
  return new URL(urlString).host
}

</script>

<template>
  <article
    v-for="day in state.dailyArchive
      .sort((a, b) => (b.sortKey.getTime() - a.sortKey.getTime()))"
    :key="day.date">
    <section>
      <header>
        <h2>{{ day.date }}</h2>
      </header>
      <ul>
        <li
          v-for="link in day.links
            .sort((a, b) => (a.posted.getTime() - b.posted.getTime()))"
          :key="link.url">
          <a :href="link.url" target="_blank">
            <span v-if="link.comment.length > 0" class="comment">
              {{ link.comment }}
            </span>
            <aside>
              {{ getDomainForURL(link.url).replace(/^www\./, '') }}
            </aside>
          </a>
        </li>
      </ul>
    </section>
  </article>
</template>