import { useContext } from 'react';
import styles from '../../styles.module.scss';
import cls from 'classnames';
import { StepperContext } from '@/contexts/SteperProvider';

function Stepper({ number, content, isDisabled }) {
  const { stepper, numberStep, textStep, isDisableNumber, isDisableText } =
    styles;

  const { setCurrentStep } = useContext(StepperContext);

  return (
    <div className={stepper} onClick={() => setCurrentStep(number)}>
      <div className={cls(numberStep, { [isDisableNumber]: isDisabled })}>
        {number}
      </div>
      <div className={cls(textStep, { [isDisableText]: isDisabled })}>
        {content}
      </div>
    </div>
  );
}

export default Stepper;
