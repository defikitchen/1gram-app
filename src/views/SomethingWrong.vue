<template>
  <Page>
    <PageContent :width="650">
      <v-card>
        <v-card-title v-text="props.title" class="py-3">
          {{ props.title }}
          <v-spacer />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <p v-text="props.message" class="mb-0" />
          <div v-if="expert" class="mt-6">
            <v-btn @click="collapsed = !collapsed">
              Log
              <v-icon
                v-text="collapsed ? 'keyboard_arrow_down' : 'keyboard_arrow_up'"
                right
              />
            </v-btn>
            <pre
              class="overflow-x-auto mt-3"
              v-text="errorParsed"
              :hidden="collapsed"
            />
          </div>
        </v-card-text>
      </v-card>
    </PageContent>
    <PageFooter :padding="true">
      <v-btn to="/" large block>
        Home
        <v-icon v-text="'home'" right />
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  watch
} from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";

export default defineComponent({
  props: {
    message: {
      default:
        "Try again or if this this problem keeps occuring contact support"
    },
    title: {
      default: "Something went wrong"
    },
    error: {
      default: "An unknown error occured"
    }
  },
  setup(_props, ctx) {
    const { store } = useVuex();
    const expert = computed(
      () => store.state.Common.Settings.mode === "expert"
    );
    const stopLoading = store.commit.Common.Loading.stopLoading;

    onMounted(() => {
      stopLoading();
    });

    const back = async () => {
      await ctx.root.$router.replace("/force-rerender");
      ctx.root.$router.go(-1);
    };

    const props = computed(() => {
      const componentProps = {
        message: _props.message,
        title: _props.title,
        error: _props.error
      };
      const props = ctx.root.$route.meta.props || componentProps;
      return props;
    });

    const errorParsed = computed(() => {
      const { error } = _props;
      try {
        return error === "string" ? error : JSON.stringify(error, null, 2);
      } catch {
        return "";
      }
    });

    const changes = computed(() => {
      return [
        _props?.message,
        _props?.title,
        _props?.error,
        ctx.root.$route.meta.props
      ];
    });

    watch(() => changes.value, stopLoading, {
      immediate: true,
      deep: true
    });

    return {
      stopLoading,
      expert,
      back,
      props,
      errorParsed
    };
  }
});
</script>
