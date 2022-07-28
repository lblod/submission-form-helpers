import { FORM } from '../namespaces';

export default function constraintsRequired(values, options) {
  if(values.length === 0){
    return false;
  }
  else if(values.length === 1){
    if(values[0].value?.length === 0){
      return false;
    }
  }
  else if(values.length > 1){
    //for input with multiple languages
    const language = options.store.match( options.constraintUri, FORM('language'), undefined)[0]?.object?.value;
    if(language){
      const value=values.find(value=>value.language==language);
      if(value?.value?.length === 0){
        return false
      }
    }
  }
  return true;
}