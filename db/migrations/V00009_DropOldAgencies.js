export default function V00009_DropOldAgencies(){
  function version(){
    return 9;
  }
  function title(){
    return "Drop Old Agencies";
  }
  function step(){
    return "drop table agencies;"
  }
  return {
    version: version(),
    step: step(),
    title: title()
  }
}