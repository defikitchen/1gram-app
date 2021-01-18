<template>
  <Page>
    <PageContent>
      <div class="phrase-container">
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <div class="mb-7 mt-3 text-center slightly-transparent">
              Write down this 12-word phrase and store it in a safe place. You
              can use this phrase to retrieve your wallet in case you lose
              access.
            </div>
            <v-chip
              v-for="(word, i) of wordsFromLength"
              large
              class="phrase-chip unclickable"
              :key="'r-' + i + word"
            >
              {{ word }}
              <span class="half-transparent ml-1">{{ i + 1 }}</span>
            </v-chip>
          </v-tab-item>

          <v-tab-item>
            <div class="mb-7 mt-3 text-center slightly-transparent">
              Select the words in the order that you wrote them down
            </div>

            <v-chip
              large
              v-for="(word, i) of randomWords"
              :color="confirmedWords.includes(word) ? 'primary' : null"
              @click="
                confirmedWords.includes(word) ? remove(word) : confirmWord(word)
              "
              class="phrase-chip"
              :key="'r-' + i + word"
              >{{ word }}</v-chip
            >

            <div v-if="confirmedWords.length">
              <v-divider class="my-5" />
              <v-chip
                v-for="(word, i) of confirmedWords"
                large
                class="phrase-chip half-transparent"
                :key="'r-' + i + word"
              >
                {{ word }}
                <span class="half-transparent ml-1">{{ i + 1 }}</span>
              </v-chip>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </div>
    </PageContent>

    <PageFooter :padding="true" class="text-center">
      <v-tabs-items v-model="tab">
        <v-btn large block color="accent" @click="next" v-if="tab === 0"
          >Continue</v-btn
        >

        <div v-else>
          <v-btn class="mb-3" text :disabled="forging || loading" @click="skip"
            >Skip</v-btn
          >
          <v-btn
            @click="submit"
            block
            large
            :loading="loading || forging"
            color="accent"
            >Verify</v-btn
          >
        </div>
      </v-tabs-items>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import SwipeBtn from "@/components/SwipeBtn.vue";
import { randomArray } from "@/lib/random-array";
import { notify } from "@/store";
import { decrypt } from "@/lib/crypto";
import {
  defineComponent,
  computed,
  ref,
  onMounted,
  watch
} from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";
import { useRouter } from "@/hooks/use-router";

export default defineComponent({
  components: {
    SwipeBtn
  },
  setup(_, ctx) {
    const {
      store: { state, commit, dispatch, getters }
    } = useVuex();
    const router = useRouter();

    const loading = computed(() => state.Common.Loading.loading);
    const forging = computed(() => state.Common.Wallet.forging);
    const wallet = computed(() => getters.Common.Wallet.wallet);
    const mnemonic = ref("");
    const phrase = ref(12);
    const randomWords = ref([] as string[]);
    const confirmedWords = ref([] as string[]);
    const tab = ref(0);

    const wordsFromLength = computed(() => {
      if (mnemonic.value) {
        return mnemonic.value
          .split(" ")
          .filter(w => !!w)
          .map(w => w.trim());
      } else return [];
    });

    const getRandomWords = () => {
      randomWords.value = randomArray(wordsFromLength.value);
    };

    watch(() => wordsFromLength.value, getRandomWords);

    const getMnemonic = () => {
      const pin = state.Common.Login.pin || "";
      const encrypted =
        wallet.value?.keyPair && wallet.value?.mnemonic
          ? wallet?.value.mnemonic
          : "";
      try {
        const decrypted = decrypt(encrypted, pin);
        return decrypted;
      } catch (e) {
        return "";
      }
    };

    onMounted(() => {
      mnemonic.value = getMnemonic();
      getRandomWords();
      if (ctx.root.$route.query.phrase) {
        phrase.value = +ctx.root.$route.query.phrase;
      }
    });

    const valid = computed(() => {
      const c = JSON.stringify(confirmedWords.value);
      const w = JSON.stringify(wordsFromLength.value);
      return c && w && c === w;
    });

    const submit = async () => {
      if (valid.value) {
        const redirect = ctx.root.$route.query.redirect as string | undefined;
        commit.Common.Wallet.patchWallet({
          address: wallet.value?.address || "",
          update: { backedUp: true }
        });
        await router.push(redirect || "/wallet");
      } else {
        notify({
          text:
            "The words don't match with the words we thought you wrote down. Please try again",
          duration: 6000
        });
        getRandomWords();
        confirmedWords.value = [];
      }
    };

    const skip = () => {
      confirmedWords.value = [...wordsFromLength.value];
      submit();
    };

    const remove = (word: string) => {
      confirmedWords.value = confirmedWords.value.filter(w => w !== word);
    };

    const randomWordsFiltered = computed(() =>
      randomWords.value.filter(w => !confirmedWords.value.includes(w))
    );

    const confirmWord = (word: string) => {
      confirmedWords.value = [...confirmedWords.value, word];
    };

    const next = async () => {
      const yes = await ctx.root.$dialog.confirm({
        type: "info",
        icon: "",
        title: "Continue",
        text: "Have you written down the 12-word phrase?"
      });
      if (yes) tab.value = tab.value + 1;
    };

    return {
      loading,
      forging,
      wallet,
      mnemonic,
      phrase,
      randomWords,
      confirmedWords,
      tab,
      wordsFromLength,
      getRandomWords,
      getMnemonic,
      valid,
      submit,
      skip,
      remove,
      randomWordsFiltered,
      confirmWord,
      next
    };
  }
});
</script>

<style scoped>
.v-tabs-items {
  background: none !important;
}
.v-window-item {
  padding: 0;
}
</style>
