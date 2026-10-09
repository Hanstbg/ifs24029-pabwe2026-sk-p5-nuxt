import { ref } from "vue";

/** Typed composable untuk two-way binding input: const [value, onChange] = useInput("") */
export function useInput(initialValue: string = "") {
  const value = ref<any>(initialValue);
  const onChange = (eventOrValue: any) => {
    value.value = eventOrValue?.target ? eventOrValue.target.value : eventOrValue;
  };
  return [value, onChange] as const;
}
