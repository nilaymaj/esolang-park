import {
  Button,
  ButtonGroup,
  Icon,
  NumericInput,
  Spinner,
  Tag,
} from "@blueprintjs/core";

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    paddingRight: 5,
    marginRight: -15,
  },
  inputWrapper: {
    /**
     * As of Feb'22, NumericInput doesn't have `small` prop yet,
     * so we instead use `transform` to hack up a slightly smaller input.
     */
    transform: "scale(0.9)",
    marginLeft: 10,
  },
  input: {
    width: 125,
  },
};

/** Possible states of the debug controls component */
type DebugControlsState = "off" | "running" | "paused" | "error";

/** Input field for changing execution interval */
const IntervalInput = (props: {
  disabled: boolean;
  onChange: (v: number) => void;
}) => {
  return (
    <div style={styles.inputWrapper}>
      <NumericInput
        min={5}
        stepSize={5}
        defaultValue={20}
        minorStepSize={null}
        leftIcon="time"
        clampValueOnBlur
        style={styles.input}
        disabled={props.disabled}
        title="Adjust the execution interval"
        onValueChange={(v) => props.onChange(v)}
        rightElement={<Tag minimal>ms</Tag>}
        allowNumericCharactersOnly
      />
    </div>
  );
};

/** Button for starting code execution */
const RunButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    outlined
    intent="success"
    onClick={onClick}
    rightIcon={<Icon icon="play" intent="success" />}
    title="Run your code"
  >
    Run code
  </Button>
);

/** Button group for debugging controls */
const DebugControls = (props: {
  state: DebugControlsState;
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  onStop: () => void;
}) => {
  const paused = props.state === "paused" || props.state === "error";
  const pauseDisabled = props.state === "error";
  const stepDisabled = ["off", "running", "error"].includes(props.state);

  return (
    <ButtonGroup>
      <Button
        outlined
        intent="primary"
        title={paused ? "Resume" : "Pause"}
        disabled={pauseDisabled}
        onClick={paused ? props.onResume : props.onPause}
        icon={<Icon icon={paused ? "play" : "pause"} intent="primary" />}
      />
      <Button
        outlined
        intent="warning"
        title="Step"
        onClick={props.onStep}
        disabled={stepDisabled}
        icon={<Icon icon="step-forward" intent="warning" />}
      />
      <Button
        outlined
        intent="danger"
        title="Stop"
        onClick={props.onStop}
        icon={<Icon icon="stop" intent="danger" />}
      />
    </ButtonGroup>
  );
};

type Props = {
  state: DebugControlsState;
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  onStop: () => void;
  onChangeInterval: (value: number) => void;
};

export const ExecutionControls = (props: Props) => {
  return (
    <div style={styles.container}>
      <div style={{ width: 20, marginRight: 15 }}>
        {props.state === "running" && <Spinner size={20} />}
      </div>
      {props.state === "off" ? (
        <RunButton onClick={props.onRun} />
      ) : (
        <DebugControls
          state={props.state}
          onPause={props.onPause}
          onResume={props.onResume}
          onStep={props.onStep}
          onStop={props.onStop}
        />
      )}
      <IntervalInput
        disabled={props.state === "running"}
        onChange={props.onChangeInterval}
      />
    </div>
  );
};
