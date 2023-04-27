import { addSimpleFormValue } from "./add-simple-form-value.js";
import { removeDatasetForSimpleFormValue } from "./remove-simple-form-value.js";

export function updateSimpleFormValue(
  options,
  newValue = null,
  oldValue = null
) {
  /* This might be tricky.We need to find a subject and predicate to attach the object to.
   * The path might contain several hops, and some of them don't necessarly exist. Consider:
   *
   *  Suppose our path is
   *  sh:path ( [ sh:inversePath besluit:heeftBesluitenlijst ] prov:startedAtTime )
   *
   *  and we only have
   *
   *  <besluitenlijst> a <Besluitenlijst>
   *
   *  A path will then be constructed with
   *   <customUri> <prov:startedAtTime> "datum".
   *   <customUri> <heeftBesluitenlijst> <besluitenlijst>.
   *
   * TODO: this is for now a best guess. And further tweaking will be needed. If this needs to be our model:
   *  <zitting> a <Zitting>
   *  <zitting> <prov:startedAtTime> "datum".
   *  <zitting> <heeftBesluitenlijst> <besluitenlijst>.
   *  <besluitenlijst> a <Besluitenlijst>
   *
   * And suppose the data store does not have:
   *  <zitting> <prov:startedAtTime> "datum".
   *  <zitting> <heeftBesluitenlijst> <besluitenlijst>.
   *
   * Then the above described solution will not work. Because our <customUri> is not linked to a <Zitting>.
   */

  if (oldValue) removeDatasetForSimpleFormValue(oldValue, options);
  if (newValue) addSimpleFormValue(newValue, options);
}
