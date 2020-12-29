<template>
  <Page>
    <PageContent>
      <v-card pb-0>
        <v-card-title class="card-title py-3">
          {{ title }}
          <v-spacer />
          <v-switch
            class="ma-0 mb-n5"
            inset
            dense
            :input-value="logging"
            @change="toggleLogging"
          />
          <v-btn
            icon
            class="mt-1 ml-n2 mr-n1 mb-n1 slightly-transparent"
            @click="clearLogs"
          >
            <v-icon>block</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="notify-form">
          <v-text-field
            @keydown.enter="notify"
            v-model="notifyData.text"
            label="Notification Text"
            clearable
            ref="notificationText"
            @click:append-outer="toggleFormExpanded"
            :append-outer-icon="
              formExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
            "
          />
          <div :hidden="!formExpanded">
            <v-text-field
              type="number"
              v-model="notifyData.duration"
              label="Duration"
            />
            <v-select
              label="Type"
              :items="['info', 'warning', 'error', 'success']"
              v-model="notifyData.type"
            />
            <v-textarea
              rows="3"
              :auto-grow="true"
              v-model="payloadModel"
              class="mono"
              label="Payload (any data type)"
            />
          </div>
        </v-card-text>
        <v-divider />

        <v-card-text>
          <div v-if="logs.length == 0">No logs to show here! Move along.</div>
          <v-list dense class="py-0">
            <template v-for="(log, i) of logs">
              <v-list-item :key="i" class="px-0">
                <v-list-item-content>
                  <v-list-item-title
                    :style="getStyle(log, arg, y)"
                    v-for="(arg, y) of log.args"
                    :key="i + '-' + y"
                  >
                    <pre v-if="!isJSON(arg)">{{ arg | hideCPerc }}</pre>
                    <span v-else style="font-family: monospace">
                      <json-view :data="arg" :maxDepth="0" />
                    </span>
                  </v-list-item-title>
                </v-list-item-content>
                <!-- <v-list-item-action hidden>
                  <v-badge
                    overlap
                    inline
                    v-if="log.length > 1"
                    color="green"
                    :content="log.args.length"
                  />
                </v-list-item-action>-->
              </v-list-item>
              <v-divider :key="`d-${i}`" v-if="i !== logs.length - 1" />
            </template>
          </v-list>
        </v-card-text>
      </v-card>
    </PageContent>
    <PageFooter :padding="true">
      <v-btn @click="notify(notifyData)" large block :color="notifyData.type">
        Notify <v-icon right>notifications</v-icon>
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch } from "vue-property-decorator";
import Page from "@/common/components/Page.vue";
import PageContent from "@/common/components/PageContent.vue";
import PageFooter from "@/common/components/PageFooter.vue";
import { listeners } from "cluster";
import { mapState } from "vuex";
import { JSONView } from "vue-json-component";
import { RootState, notify } from "@/common/store";
import { LogEntry } from "@/common/models/logentry";
import { themeColors } from "@/vuetify";

@Component({
  components: {
    Page,
    PageContent,
    PageFooter,
    "json-view": JSONView
  },
  filters: {
    reverse(arr: any[]) {
      return [...(arr || [])].reverse();
    },
    hideCPerc(arg: string) {
      if (typeof arg === "string" && arg.indexOf("%c") === 0) {
        return arg.substr(2);
      } else {
        return arg;
      }
    }
  },
  computed: {
    ...mapState<RootState>({
      logs: state => state.Console.logs,
      logging: state => state.Console.logging
    })
  }
})
export default class Console extends Vue {
  title = "Console Logs";
  formExpanded = false;

  notifyData = {
    text: "Hello World",
    type: "error" as "error" | "info" | "success" | "warning",
    duration: 3000,
    payload: {
      error: "custom error data"
    } as any
  };

  toggleFormExpanded() {
    this.formExpanded = !this.formExpanded;
  }

  get payloadModel() {
    const { payload } = this.notifyData;
    if (payload === null) return "";
    return typeof payload === "object"
      ? JSON.stringify(payload, null, 2)
      : payload + "";
  }

  set payloadModel(data: string) {
    try {
      this.notifyData.payload = JSON.parse(data);
    } catch {
      this.notifyData.payload = data;
    }
  }

  clearLogs() {
    this.$store.commit("Console/clearLogs");
  }

  mounted() {
    this.$store.commit("Common/stopLoading");
  }

  isJSON(obj: any) {
    if (obj === null || obj === undefined) return false;
    return obj.constructor === {}.constructor;
  }

  getStyle(log: LogEntry, text: any[], i: number) {
    let color = "lightgrey";
    const customStyle =
      typeof log.args[0] === "string" &&
      log.args[0].indexOf("%c") === 0 &&
      log.args[1];
    switch (log.type) {
      case "info":
        color = themeColors.info;
        break;
      case "error":
        color = themeColors.error;
        break;
      case "warn":
        color = themeColors.warning;
        break;
    }
    if (log.type === "log") {
      if (customStyle && i === 1) {
        return "display: none";
      }
      return customStyle;
    } else {
      return `color: ${color}; `;
    }
  }

  toggleLogging() {
    this.$store.dispatch("Console/toggleLogging");
  }

  async notify() {
    const input = this.$refs.notificationText as HTMLInputElement;
    if (!this.notifyData.text) return input.focus();
    notify(this.notifyData);
  }
}
</script>

<style scoped>
.notify-form {
  background: rgba(0, 0, 0, 0.02);
}
</style>
