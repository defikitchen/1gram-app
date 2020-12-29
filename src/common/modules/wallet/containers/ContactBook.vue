<template>
  <Page>
    <page-header>
      <v-text-field
        ref="search"
        outlined
        rounded
        hide-details
        v-model="filter"
        placeholder="Search by name or address"
        class="my-1"
        dense
        light
        autocomplete="off"
        clearable
      />
    </page-header>
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

    <page-content width="500">
      <p
        class="text-center half-transparent py-6"
        v-if="(contacts || []).length < 1"
      >
        No contacts found...
      </p>
      <template v-for="(contacts, name, index) in groupedContacts" v-else>
        <v-subheader class="px-0" :key="'h-' + index">{{ name }}</v-subheader>

        <v-card class="mb-4" :key="index">
          <v-list class="list--clean">
            <v-list-item
              active-class="active"
              v-for="(contact, i) of orderBy(contacts, 'name')"
              :key="i"
              class="px-4"
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
                  >{{ contact.address | shortify(20) }} ({{
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
                    <v-icon color="primary">send</v-icon></v-btn
                  >
                </v-list-item-action-text>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </template>
    </page-content>
    <PageFooter :padding="true">
      <v-btn block large color="accent" to="?modal=addContact">
        <v-icon left>add</v-icon> Add Contact
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "@vue/composition-api";
import { useVuex } from "@/common/hooks/use-vuex";
import { Network } from "@/common/models/network";
import { Contact } from "@/common/models/contact";
import { useRouter } from "@/common/hooks/use-router";
import { useCopy } from "@/common/hooks/use-copy";
import { Wallet } from "@/common/models/wallet";
import Vue2Filters from "vue2-filters";

interface GroupedContacts {
  [name: string]: Contact[];
}

export default defineComponent({
  mixins: [Vue2Filters.mixin],
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

    const getNetworkByName = (name: string) => {
      return store.state.Wallet.networks.find(network => network.name === name);
    };

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

    const groupedContacts = computed(() =>
      filteredContacts.value.reduce((grouped, contact) => {
        const networkName = contact.network.name || "";
        if (!networkName) return grouped;
        grouped[networkName] = grouped[networkName] || [];
        grouped[networkName].push(contact);
        return grouped;
      }, {} as GroupedContacts)
    );

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
      selectedAddress,
      groupedContacts,
      getNetworkByName
    };
  }
});
</script>
