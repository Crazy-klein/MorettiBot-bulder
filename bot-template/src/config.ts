// @ts-nocheck
export const config = {
  name: "{{BOT_NAME}}",
  type: "{{BOT_TYPE}}",
  prefix: "{{BOT_PREFIX}}",
  ownerName: "{{OWNER_NAME}}",
  ownerNumber: "{{OWNER_NUMBER}}",
  enabledModules: {{ENABLED_MODULES}},
  version: "1.0.0",
  messageStyle: {
    enabled: {{MESSAGE_STYLE_ENABLED}},
    preset: '{{MESSAGE_STYLE_PRESET}}',
    custom: {
      topLeft: '{{CUSTOM_TOP_LEFT}}',
      topRight: '{{CUSTOM_TOP_RIGHT}}',
      bottomLeft: '{{CUSTOM_BOTTOM_LEFT}}',
      bottomRight: '{{CUSTOM_BOTTOM_RIGHT}}',
      horizontal: '{{CUSTOM_HORIZONTAL}}',
      vertical: '{{CUSTOM_VERTICAL}}',
      leftPrefix: '{{CUSTOM_LEFT_PREFIX}}',
      titleSeparator: '{{CUSTOM_TITLE_SEPARATOR}}',
      linePrefix: '{{CUSTOM_LINE_PREFIX}}'
    }
  }
};
