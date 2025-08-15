export type StateId = string;

export type TransitionRule<
  S extends StateId,
  C,
> = {
  from: S;
  to: S | ((context: C, from: S) => S);

  guard?: (context: C, from: S) => boolean;
  afterMs?: number;
};

export type FSMConfig<S extends StateId, C> = {
  initial: S;
  transitions: TransitionRule<S, C>[];
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
  C,
> {
  private readonly transitionsByFrom = new Map<
    S,
    TransitionRule<S, C>[]
  >();
  private readonly onEnter?: FSMConfig<
    S,
    C
  >["onEnter"];
  private readonly onExit?: FSMConfig<
    S,
    C
  >["onExit"];

  state: S;
  previous: S | null = null;
  timeInStateMs = 0;

  constructor(
    private readonly config: FSMConfig<S, C>
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
      this.transition(rule, context);
      break;
    }
  }

  dispatch(context: C): void {
    const rules =
      this.transitionsByFrom.get(this.state) ||
      [];
    for (const rule of rules) {
      if (
        rule.guard &&
        !rule.guard(context, this.state)
      )
        continue;
      this.transition(rule, context);
      break;
    }
  }

  canTransition(target: S, context: C): boolean {
    const rules =
      this.transitionsByFrom.get(this.state) ||
      [];
    for (const rule of rules) {
      const to: S =
        typeof rule.to === "function"
          ? (rule.to as (c: C, f: S) => S)(
              context,
              this.state
            )
          : (rule.to as S);
      if (to !== target) continue;
      if (
        rule.afterMs !== undefined &&
        this.timeInStateMs < rule.afterMs
      )
        continue;
      if (
        rule.guard &&
        !rule.guard(context, this.state)
      )
        continue;
      return true;
    }
    return false;
  }

  tryTransition(target: S, context: C): boolean {
    const rules =
      this.transitionsByFrom.get(this.state) ||
      [];
    for (const rule of rules) {
      const to: S =
        typeof rule.to === "function"
          ? (rule.to as (c: C, f: S) => S)(
              context,
              this.state
            )
          : (rule.to as S);
      if (to !== target) continue;
      if (
        rule.afterMs !== undefined &&
        this.timeInStateMs < rule.afterMs
      )
        continue;
      if (
        rule.guard &&
        !rule.guard(context, this.state)
      )
        continue;
      this.transition(rule, context);
      return true;
    }
    return false;
  }

  private transition(
    rule: TransitionRule<S, C>,
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
