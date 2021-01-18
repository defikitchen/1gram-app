import { setCache, getCache } from "@/lib/cache";
import { Contact } from "@/models/contact";
import { defineActions, defineModule, defineMutations } from "direct-vuex";
import { moduleActionContext } from ".";

export interface ContactsState {
  contacts: Contact[];
}

const state: ContactsState = {
  contacts: getCache("contacts", [])
};

const syncCache = (state: ContactsState) => {
  setCache("contacts", state.contacts);
};

const mutations = defineMutations<ContactsState>()({
  addContact: (state, contact: Contact) => {
    state.contacts = [...state.contacts, contact];
    syncCache(state);
  },
  removeContact: (state, contact: Contact) => {
    state.contacts = state.contacts.filter(c => c.id !== contact.id);
    syncCache(state);
  },
  editContact: (state, contact: Contact) => {
    state.contacts = [
      ...state.contacts.filter(c => c.id !== contact.id),
      contact
    ];
    syncCache(state);
  }
});

const actions = defineActions({});

const mod = defineModule({
  state,
  mutations,
  actions,
  namespaced: true
});

export default mod;

const moduleCtx = (context: any) => moduleActionContext(context, mod);
