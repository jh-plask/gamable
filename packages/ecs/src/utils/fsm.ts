export type StateId = string;
export type EventId = string;

export type TransitionRule<
  S extends StateId,
  E extends EventId,
  C,
> = {
  from: S;
  to: S | ((context: C, from: S) => S);
  event?: E;
  guard?: (
    context: C,
    from: S,
    event?: E
  ) => boolean;
  afterMs?: number;
};

export type FSMConfig<
  S extends StateId,
  E extends EventId,
  C,
> = {
  initial: S;
  transitions: TransitionRule<S, E, C>[];
  onEnter?: Partial<
    Record<
      S,
      (context: C, from: S | null) => void
    >
  >;
  onExit?: Partial<
    Record<S, (context: C, to: S) => void>
  >;
};

export class FiniteStateMachine<
  S extends StateId,
  E extends EventId,
  C,
> {
  private readonly transitionsByFrom = new Map<
    S,
    TransitionRule<S, E, C>[]
  >();
  private readonly onEnter?: FSMConfig<
    S,
    E,
    C
  >["onEnter"];
  private readonly onExit?: FSMConfig<
    S,
    E,
    C
  >["onExit"];

  state: S;
  previous: S | null = null;
  timeInStateMs = 0;

  constructor(
    private readonly config: FSMConfig<S, E, C>
  ) {
    this.state = config.initial;
    this.onEnter = config.onEnter;
    this.onExit = config.onExit;

    for (const rule of config.transitions) {
      const list =
        this.transitionsByFrom.get(
          rule.from as S
        ) || [];
      list.push(rule);
      this.transitionsByFrom.set(
        rule.from as S,
        list
      );
    }
  }

  update(deltaMs: number, context: C): void {
    if (deltaMs < 0) return;
    this.timeInStateMs += deltaMs;
    const rules =
      this.transitionsByFrom.get(this.state) ||
      [];
    for (const rule of rules) {
      if (rule.afterMs === undefined) continue;
      if (this.timeInStateMs < rule.afterMs)
        continue;
      if (
        rule.guard &&
        !rule.guard(context, this.state)
      )
        continue;
      this.transition(rule, undefined, context);
      break;
    }
  }

  dispatch(event: E, context: C): void {
    const rules =
      this.transitionsByFrom.get(this.state) ||
      [];
    for (const rule of rules) {
      if (rule.event !== event) continue;
      if (
        rule.guard &&
        !rule.guard(context, this.state, event)
      )
        continue;
      this.transition(rule, event, context);
      break;
    }
  }

  private transition(
    rule: TransitionRule<S, E, C>,
    event: E | undefined,
    context: C
  ): void {
    const from = this.state;
    const target =
      typeof rule.to === "function"
        ? (rule.to as (c: C, f: S) => S)(
            context,
            from
          )
        : rule.to;

    if (target === from) {
      this.timeInStateMs = 0;
      return;
    }

    if (this.onExit && from in this.onExit) {
      this.onExit[from]?.(context, target);
    }

    this.previous = from;
    this.state = target;
    this.timeInStateMs = 0;

    if (this.onEnter && target in this.onEnter) {
      this.onEnter[target]?.(context, from);
    }
  }
}
