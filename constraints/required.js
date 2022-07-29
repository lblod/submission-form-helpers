import { FORM } from '../namespaces';

export default function constraintsRequired(values, options) {
  //no values
  if (values.length === 0) {
    return false;
  }
  //1 or more values/input boxes
  else if (values.length > 0) {
    //check if there is a language constraint
    const languageConstraint = options.store.match(options.constraintUri, FORM('language'), undefined)[0]?.object?.value;
    if (languageConstraint) {
      //match the value to the constraint
      //this is wierd since it will fail if there are multiple same language paths
      const value = values.find(value => value.language === languageConstraint);
      if (!value) {
        return false;
      }
      else if (value?.value?.length === 0) {
        return false;
      }

    }
    else {
      //no way to determine which box is validated so we validate all of them
      //this will cause ui bugs
      let allEmpty = true;
      for (const value of values) {
        if (value.value?.length > 0) {
          allEmpty = false;
          break;
        }
      }
      if (allEmpty) {
        return false;
      }
    }
  }

  return true;
}