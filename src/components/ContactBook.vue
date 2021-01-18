<template>
  <div>
    <v-bottom-sheet v-model="sheet">
      <v-list>
        <v-list-item>
          <v-list-item-title
            ><v-subheader class="px-0"
              >Select Wallet</v-subheader
            ></v-list-item-title
          >
        </v-list-item>
        <div
          @click="selectWallet(w)"
          v-for="w of wallets.filter(_w => _w.network.name === networkName)"
          :key="w.address"
        >
          <wallet-item :wallet="w" />
        </div>
      </v-list>
    </v-bottom-sheet>

    <v-list>
      <v-list-item>
        <v-text-field
          ref="search"
          outlined
          rounded
          hide-details
          v-model="filter"
          placeholder="Search contact by name or address"
          class="my-3"
          dense
          append-outer-icon="add"
          @click:append-outer="$router.push({ query: { modal: 'addContact' } })"
        ></v-text-field>
      </v-list-item>

      <v-list-item
        active-class="active"
        v-for="(contact, i) of contacts"
        :key="i"
        @click="
          $emit('select', contact);
          copy(contact.address);
        "
      >
        <v-list-item-avatar>
          <identicon :seed="contact.address" :size="45" />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ contact.name }}</v-list-item-title>
          <v-list-item-subtitle
            >{{ shortify(contact.address, 20) }} ({{
              contact.network.protocol
            }})</v-list-item-subtitle
          >
        </v-list-item-content>
        <v-list-item-action>
          <v-list-item-action-text>
            <v-btn
              icon
              @click.stop="edit(contact)"
              small
              class="half-transparent ml-2"
            >
              <v-icon>edit</v-icon></v-btn
            >
            <v-btn
              icon
              @click.stop="copy(contact.address)"
              small
              class="half-transparent ml-2"
            >
              <v-icon>content_copy</v-icon></v-btn
            >
            <v-btn icon @click.stop="send(contact)" small class="ml-2">
              <v-icon>send</v-icon></v-btn
            >
          </v-list-item-action-text>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";
import { Network } from "@/models/network";
import { Contact } from "@/models/contact";
import { useRouter } from "@/hooks/use-router";
import { useCopy } from "@/hooks/use-copy";
import { Wallet } from "@/models/wallet";

export default defineComponent({
  setup() {
    const { store } = useVuex();
    const contacts = computed(() => store.state.Contacts.contacts);

    const router = useRouter();
    const copy = (str: string) => useCopy(str);
    const filter = ref("");
    const wallets = computed(() => store.state.Wallet.wallets || []);
    const selectedAddress = ref("");
    const sheet = ref(false);
    const networkName = ref(store.getters.Wallet.wallet?.network.name || null);

    const edit = (contact: Contact) => {
      router.push({
        query: {
          modal: "addContact",
          id: contact.id
        }
      });
    };

    const filteredContacts = computed(() => {
      const q = filter.value.trim().toLowerCase();
      const unordered = contacts.value || [];
      const list = unordered.sort((a, b) =>
        a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 0
      );
      if (!q) return list;
      else
        return list.filter(c =>
          [c.address, c.name].some(text => text.toLowerCase().includes(q))
        );
    });

    const send = (contact: Contact) => {
      sheet.value = true;
      networkName.value = contact.network.name || null;
      selectedAddress.value = contact.address;
    };

    const selectWallet = (wallet: Wallet) => {
      store.commit.Wallet.setWallet(wallet);
      const to = selectedAddress.value;
      const from = wallet.address || "";
      if (!from || !to) {
        console.log(to, from, wallet);
        return;
      }
      store.commit.Wallet.setPendingTx({
        amount: null,
        estimatedFees: null,
        from,
        to
      });
      router.push("/wallet/send");
      sheet.value = false;
    };

    return {
      contacts: filteredContacts,
      edit,
      copy,
      filter,
      wallets,
      sheet,
      selectWallet,
      send,
      networkName,
      selectedAddress
    };
  }
});
</script>
