<template>
  <div class="pa-4">
    <v-list class="list--clean mb-2 pt-0 mt-0">
      <v-list-item class="my-2">
        <v-select
          v-model="network"
          :items="networkList"
          hide-details
          label="Network"
        />
      </v-list-item>

      <v-list-item class="my-2">
        <v-text-field
          label="Address"
          v-model="form.address"
          hide-details
          append-outer-icon="qr_code"
          @click:append-outer="scanQr"
        />
      </v-list-item>
      <v-list-item class="my-2">
        <v-text-field
          label="Name"
          ref="nameField"
          v-model="form.name"
          hide-details
        />
      </v-list-item>
      <v-list-item class="my-2" v-if="form.id">
        <v-btn color="error" outlined block @click="remove(form.id)">
          Remove Contact
        </v-btn>
      </v-list-item>
    </v-list>

    <v-btn block large type="button" color="accent" @click="submit">Save</v-btn>
  </div>
</template>

<script lang="ts">
import { makeid } from "@/lib/makeid";
import { notify } from "@/store";
import {
  defineComponent,
  computed,
  reactive,
  watch,
  onMounted,
  ref
} from "@vue/composition-api";
import { defaultNetworks } from "@/lib/constants";
import { useVuex } from "@/hooks/use-vuex";
import { Contact } from "@/models/contact";
import { Network } from "@/models/network";
import { handleError } from "@/lib/error-handling";
import { useRouter } from "@/hooks/use-router";
import { useQr } from "@/hooks/use-qr";

export default defineComponent({
  setup(_, ctx) {
    const networkKey = (network?: Network | null) =>
      network ? network.protocol + " - " + network.name : "";
    const { store } = useVuex();
    const router = useRouter();
    const network = ref(networkKey(store.state.Wallet.network));
    const nameField = ref<null | HTMLInputElement>(null);
    const networks = computed(() => store.state.Wallet.networks);
    const contacts = computed(() => store.state.Contacts.contacts);

    const defaultForm = {
      name: "",
      address: "",
      id: ""
    };

    const form = reactive({ ...defaultForm });

    const isValid = computed(() => form.name && form.address && network.value);

    const reset = () => {
      Object.assign(form, { ...defaultForm });
    };

    const remove = (id: string) => {
      store.commit.Contacts.removeContact(
        contacts.value.find(c => c.id === id) as Contact
      );
      reset();
      ctx.emit("submit");
    };

    watch(
      () => ctx.root.$route.query,
      () => {
        reset();
        const { id, address, networkName } = ctx.root.$route.query;
        if (address && typeof address === "string") form.address = address;
        if (networkName && typeof networkName === "string") {
          const found = networks.value.find(n => n.name === networkName);
          if (found) network.value = networkKey(found);
          setTimeout(() => {
            nameField.value?.focus();
          }, 500);
        }
        if (!id) return;
        const contact = contacts.value.find(c => c.id === id);
        if (!contact) return;
        network.value = networkKey(contact.network);
        form.name = contact.name;
        form.address = contact.address;
        form.id = contact.id;
      },
      {
        immediate: true,
        deep: true
      }
    );

    const scanQr = async () => {
      const qr = await useQr().getQr();
      if (!qr) return;
      await router.push("?modal=addContact&address=" + qr);
    };

    const submit = () => {
      if (!isValid.value)
        return handleError({}, "Please fill out all fields correctly");
      const id = ctx.root.$route.query.id;

      const contact: Contact = {
        id: form.id || makeid(),
        network: networks.value.find(
          n => n.name === network.value.split(" - ")[1]
        ) as Network,
        name: form.name,
        address: form.address,
        lastUsed: new Date().getTime()
      };

      if (!id) {
        store.commit.Contacts.addContact(contact);
      } else {
        store.commit.Contacts.editContact(contact);
      }

      reset();
      ctx.emit("submit");
    };

    return {
      form,
      network,
      networks,
      networkList: computed(() =>
        networks.value.map(n => n.protocol + " - " + n.name)
      ),
      nameField,
      submit,
      remove,
      scanQr
    };
  }
});
</script>

<style lang="scss" scoped>
.v-label {
  margin: 0;
  vertical-align: middle;
  font-size: 13px;
}

.theme--dark.v-list-item--active:hover::before,
.theme--dark.v-list-item--active::before {
  opacity: 0;
}
</style>
