import { FORM } from '../namespaces';

export default function constraintsRequired(values, options) {
  const hasValues = values.length > 0 ? true : false;
  if(!hasValues){
    return false;
  }
  //for input with multiple languages
  const language = options.store.match( options.constraintUri, FORM('language'), undefined)[0]?.object?.value;
  if(language){
    const value=values.find(value=>value.language==language);
    if(value?.value?.length==0){
      return false
    }
  }
  return true;
}