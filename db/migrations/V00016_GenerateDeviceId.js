import {v1} from "uuid";

export default function V00016_GenerateDeviceId() {
  function version() {
    return 16;
  }

  function title() {
    return "Generate Device ID";
  }

  function step() {
    return `REPLACE INTO configs(\`key\`, \`value\`) VALUES ('deviceId', '${v1()}')`
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}