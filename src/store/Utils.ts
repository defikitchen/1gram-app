import { defineModule } from "direct-vuex";
import { defineActions } from "direct-vuex";
import { notify } from ".";
import getPlatform, { Platform } from "@/lib/get-platform";
import QRCode from "qrcode";
import copy from "copy-to-clipboard";

export interface UtilsState {}

const state: UtilsState = {};

const actions = defineActions({
  /**
   *
   * @param str The string to copy
   * @remarks
   *  * Notifies the user of the copied string
   *  * If block to support Electron
   * @returns `str: String`
   */
  copy(_, value: string) {
    const platform = getPlatform();
    let text = `${value.slice(0, 15)}...\n Copied to clipboard `;
    let success = true;

    try {
      if (platform === Platform.Electron) {
        require("electron").clipboard.writeText(value);
      } else if (platform === Platform.Cordova) {
        (window as any).cordova.plugins.clipboard.copy(value);
      } else {
        copy(value);
      }
    } catch {
      success = false;
    }

    notify({
      text,
      duration: 2000,
      type: success ? "info" : "error"
    });
    return value;
  },
  /**
   * Get the QR code from any wallet
   * @param value `string`
   * @returns `Promise<string>` base64 string of the QR Code PNG
   */
  async getQR(_, value: string): Promise<string> {
    try {
      return await QRCode.toDataURL(value);
    } catch (error) {
      console.warn(error);
      return "";
    }
  },
  downloadURL(_, payload: { url: string; name: string }) {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute("style", "display: none");
    a.setAttribute("href", payload.url);
    a.setAttribute("download", payload.name);
    a.click();
  },
  downloadString(
    _,
    payload: { value: string; encoding: string; name: string }
  ) {
    console.log(payload.value);
    const buffer = Buffer.from(
      payload.value,
      (payload.encoding as any) || "hex"
    );
    const blob = new Blob([buffer], { type: "octet/stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute("style", "display: none");
    a.setAttribute("href", url);
    a.setAttribute("download", payload.name);
    a.click();
    URL.revokeObjectURL(url);
  }
});

const module = defineModule({
  state,
  actions,
  namespaced: false
});

export default module;
