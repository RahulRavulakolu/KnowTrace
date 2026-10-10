# Learner model

KnowTrace uses Bayesian Knowledge Tracing:

`P(correct) = p(1-slip) + (1-p)guess`

The posterior is computed with Bayes' rule and blended into `p`. Guess and slip
are heuristics, not fitted psychometric parameters. Evidence modifiers are:
hint `0.5`, fast response `1.2`, confident-wrong `1.3`, and read feedback `0.8`.

Forgetting uses `p_eff = p + (prior-p)*exp(-delta_days/half_life)`. Half-life
starts at three days, doubles after success, and caps at 60 days. Weak
prerequisites (`p_eff < 0.4`) receive extra practice. Cold-start self-rating
`r` maps to `0.2 + 0.1*(r-1)`.

These are transparent heuristics, not claims about real human learning. The
independent IRT simulator is used for personalization regression.
