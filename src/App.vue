<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <div class="w-full my-4"></div>
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Тикер</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="ticker"
                @keydown.enter="addTicker"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
              />
            </div>
            <!--            <p class="text-red-500 text-xs italic">Please choose a password.</p>-->
          </div>
        </div>
        <button
          @click="addTicker"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Добавить
        </button>
      </section>

      <!-- FILTERS -->
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <section class="flex">
          <div class="relative rounded-md shadow-md">
            <input
              type="text"
              v-model="filterSearchQuery"
              class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              placeholder="BTC"
            />
          </div>
          <div class="flex items-center ml-auto gap-2">
            <button
              :disabled="!(this.currentPage > 1)"
              @click="decreaseCurrentPage"
              class="inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-300"
            >
              Prev
            </button>
            <span
              class="inline-flex items-center py-1 px-2 bg-gray-300 rounded-md"
            >
              {{ this.currentPage + "/" + this.totalPages }}
            </span>
            <button
              :disabled="!(this.currentPage < this.totalPages)"
              @click="increaseCurrentPage"
              class="inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </section>
      </template>

      <section>
        <hr class="w-full border-t border-gray-600 my-4" />
        <template v-if="filteredTickers.length">
          <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div
              v-for="t in paginatedTickers"
              :key="t.id"
              @click="setSelectedTicker(t)"
              class="bg-white overflow-hidden shadow rounded-lg border-2 border-transparent border-solid cursor-pointer"
              :class="{ 'border-2 border-purple-800': t === selectedTicker }"
            >
              <div class="px-4 py-5 sm:p-6 text-center">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  {{ t.name }} - USD
                </dt>
                <dd class="mt-1 text-3xl font-semibold text-gray-900">
                  {{ t.price }}
                </dd>
              </div>
              <div class="w-full border-t border-gray-200"></div>
              <button
                @click.stop="deleteTicker(t)"
                class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
              >
                <svg
                  class="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="#718096"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  ></path></svg
                >Удалить
              </button>
            </div>
          </dl>
        </template>
        <p v-else-if="!tickers.length">
          You don't have any tickers, add once 😉
        </p>
        <p v-else-if="!filteredTickers.length">
          We didn't find the tickers you asked for 😔
        </p>
        <hr class="w-full border-t border-gray-600 my-4" />
      </section>
      <section class="relative" v-if="selectedTicker">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicker.name }} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div
            v-for="bar in normalizedGraph"
            :key="bar"
            class="bg-purple-800 border w-10"
            :style="{ height: bar + '%' }"
          ></div>
        </div>
        <button
          @click="selectedTicker = null"
          type="button"
          class="absolute top-0 right-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<script>
import { getTickets } from "@/shared/api/api";

const TICKERS_PER_PAGE = 3;

const StateKeyByParamsName = {
  filter: "filterSearchQuery",
  page: "currentPage",
};

export default {
  name: "App",

  data() {
    return {
      ticker: "",
      tickers: [
        { id: 1, name: "DEMO1", price: "-", graph: ["22", "33", "67"] },
        { id: 2, name: "DEMO2", price: "2", graph: ["22", "33"] },
        { id: 4, name: "DEMO1", price: "-", graph: ["22", "33"] },
        { id: 3, name: "DEMO3", price: "-", graph: ["22", "33"] },
        { id: 5, name: "DEMO2", price: "2", graph: ["22", "33"] },
        { id: 6, name: "DEMO3", price: "-", graph: ["22", "33"] },
        { id: 7, name: "DEMO1", price: "-", graph: ["22", "33"] },
        { id: 8, name: "DEMO2", price: "2", graph: ["22", "33"] },
        { id: 9, name: "DEMO3", price: "-", graph: ["22", "33"] },
      ],
      filterSearchQuery: "",
      selectedTicker: null,
      currentPage: 1,
      graph: [],
    };
  },
  created() {
    // TODO: refactor
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    console.log(this.currentPage);

    Object.keys(StateKeyByParamsName).forEach((key) => {
      if (windowData[key]) {
        this[StateKeyByParamsName[key]] = windowData[key];
      }
    });
    console.log(this.currentPage);
  },
  mounted() {
    getTickets().then((r) => {
      console.log(r);
    });
  },
  computed: {
    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.name.toLowerCase().includes(this.filterSearchQuery.toLowerCase())
      );
    },
    totalPages() {
      return Math.ceil(this.filteredTickers.length / TICKERS_PER_PAGE);
    },
    paginationIndexes() {
      const startIndex = (this.currentPage - 1) * TICKERS_PER_PAGE;
      const endIndex = this.currentPage * TICKERS_PER_PAGE;
      return [startIndex, endIndex];
    },
    paginatedTickers() {
      return this.filteredTickers.slice(...this.paginationIndexes);
    },
    normalizedGraph() {
      const max = Math.max(...this.graph);
      const min = Math.min(...this.graph);

      if (max === min) {
        return this.graph.map(() => 50);
      }

      return this.graph.map((price) => 5 + ((price - min) * 95) / (max - min));
    },
    pageStateOptions(state) {
      const { filterSearchQuery, currentPage } = state;
      return { filterSearchQuery, currentPage };
    },
  },
  methods: {
    addTicker() {
      const newTicker = {
        name: this.ticker,
        price: "-",
      };

      this.tickers.push(newTicker);
      this.ticker = "";
      this.filterSearchQuery = "";
    },

    deleteTicker(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t !== tickerToRemove);
    },

    setSelectedTicker(tickerToSelect) {
      this.selectedTicker = tickerToSelect;
    },

    increaseCurrentPage() {
      if (this.currentPage === this.totalPages) return;
      this.currentPage++;
    },

    decreaseCurrentPage() {
      if (this.currentPage === 1) return;
      this.currentPage--;
    },
  },
  watch: {
    tickers(newValue) {
      // if deleted items is selected
      if (!newValue.includes(this.selectedTicker)) {
        this.selectedTicker = null;
      }
    },
    filterSearchQuery() {
      // if we delete items
      this.currentPage = 1;
    },
    selectedTicker(newValue) {
      this.graph = newValue?.graph;
    },
    currentPage(newValue) {
      // if we get incorrect value from url search params
      if (newValue < 1 || newValue > this.totalPages) {
        this.currentPage = 1;
      }
    },
    totalPages(newValue) {
      // if we delete items
      if (newValue < this.currentPage) {
        this.currentPage = newValue;
      }
    },
    pageStateOptions(pageState) {
      // TODO: refactor
      let url = new URL(window.location);

      Object.entries(StateKeyByParamsName).forEach(([paramsName, stateKey]) => {
        const value = pageState[stateKey];
        url.searchParams.set(paramsName, value);
        if (value === "") {
          url.searchParams.delete(paramsName);
        }
      });

      window.history.pushState(null, document.title, url.toString());
    },
  },
};
</script>

<!-- TODO: COMMON: Add Graphic, Add API, Add Sort, Add Pagination Type (Lazy, Pages), Add localization, Add theme, Add Websockets -->
<!-- TODO: INPUT: ON-TICKET-ADD: set focus, AutoComplete, Validate -->
