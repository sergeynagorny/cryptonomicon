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
          class="my-4 inline-flex items-center gap-x-3 py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <IconBase iconName="icon-add" />
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
                  {{ t.isValid ? formattedPrice(t.price) : "❌" }}
                </dd>
              </div>
              <div class="w-full border-t border-gray-200"></div>
              <button
                @click.stop="deleteTicker(t)"
                class="flex items-center gap-x-2 justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
              >
                <icon-base icon-name="icon-delete" />
                Удалить
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
        <div
          ref="graphContainer"
          class="flex items-end border-gray-600 border-b border-l h-64"
        >
          <div
            v-for="(bar, index) in normalizedGraphs"
            ref="graphElement"
            :key="index"
            class="bg-purple-800 border w-10"
            :style="{ height: bar + '%' }"
          ></div>
        </div>
        <button
          @click="selectedTicker = null"
          type="button"
          class="absolute top-0 right-0"
        >
          <icon-base icon-name="icon-close" />
        </button>
      </section>
    </div>
  </div>
</template>

<script>
import { subscribeToTicker, unsubscribeFromTicker } from "@/shared/api/api";
import * as _ from "lodash";
import IconBase from "@/shared/icons/IconBase";

const TICKERS_PER_PAGE = 3;

const StateKeyByParamsName = {
  filter: "filterSearchQuery",
  page: "currentPage",
};

export default {
  name: "App",
  components: { IconBase },
  data() {
    return {
      ticker: "",
      tickers: [],
      filterSearchQuery: "",
      selectedTicker: null,
      currentPage: 1,
      graph: [],
      maxGraphElements: null,
    };
  },
  created() {
    // TODO: refactor
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    Object.keys(StateKeyByParamsName).forEach((key) => {
      if (windowData[key]) {
        this[StateKeyByParamsName[key]] = windowData[key];
      }
    });
  },
  mounted() {
    window.addEventListener("resize", this.calculateMaxGraphElements);
  },
  beforeUnmount() {
    window.addEventListener("resize", this.calculateMaxGraphElements);
  },
  computed: {
    tickerKeys() {
      return _.map(this.tickers, "name");
    },
    filteredTickers() {
      const bySearch = ({ name }) =>
        name.toLowerCase().includes(this.filterSearchQuery.toLowerCase());

      return this.tickers.filter(bySearch);
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
    displayedGraphs() {
      return this.graph?.slice(-this.maxGraphElements, this.graph.length) || [];
    },
    normalizedGraphs() {
      const max = Math.max(...this.displayedGraphs);
      const min = Math.min(...this.displayedGraphs);

      if (max === min) {
        return this.displayedGraphs.map(() => 50);
      }

      return this.displayedGraphs.map(
        (price) => 5 + ((price - min) * 95) / (max - min)
      );
    },
    pageStateOptions(state) {
      const { filterSearchQuery, currentPage } = state;
      return { filterSearchQuery, currentPage };
    },
  },
  methods: {
    calculateMaxGraphElements() {
      const containerWidth = this.$refs.graphContainer?.offsetWidth;
      const [firstGraph] = this.$refs.graphElement || [];
      const elementWidth = firstGraph?.offsetWidth;

      if (!elementWidth || !containerWidth) return;
      this.maxGraphElements = Math.floor(containerWidth / elementWidth);
    },
    addTicker() {
      if (this.tickerKeys.includes(this.ticker)) return;

      const newTicker = {
        name: this.ticker,
        price: "-",
        isValid: true,
        graph: [],
      };

      this.tickers = [...this.tickers, newTicker];
      this.ticker = "";
      this.filterSearchQuery = "";

      subscribeToTicker(
        newTicker.name,
        (newPrice) => this.updateTicker(newTicker.name, { price: newPrice }),
        () => this.updateTicker(newTicker.name, { isValid: false })
      );
    },

    updateTicker(tickerName, { price, isValid = true }) {
      const ticker = this.tickers.find(({ name }) => name === tickerName);
      if (!ticker) return;

      ticker.isValid = isValid;

      if (price) {
        ticker.price = price;
        ticker.graph.push(price);
      }
    },

    formattedPrice(price) {
      if (_.isString(price)) return price;
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },

    deleteTicker(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t !== tickerToRemove);
      unsubscribeFromTicker(tickerToRemove.name);
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

      // select new ticker
      this.selectedTicker = this.tickers.slice().pop() || null;
    },
    filterSearchQuery() {
      // if we delete items
      this.currentPage = 1;
    },
    selectedTicker(newValue) {
      this.graph = newValue?.graph;
      this.$nextTick().then(this.calculateMaxGraphElements);
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
      // TODO: refactor, use router
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
<!-- TODO: UI: Add Pulse on update, add gasp number animation on update -->
