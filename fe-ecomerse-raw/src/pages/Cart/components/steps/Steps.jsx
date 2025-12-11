import Stepper from '@/pages/Cart/components/steps/Stepper';
import styles from '../../styles.module.scss';
import { useContext } from 'react';
import { StepperContext } from '@/contexts/SteperProvider';

function Steps() {
  const { containerSteps, steps, line, textNoti } = styles;
  const { currentStep } = useContext(StepperContext);

  const dataSteps = [
    { number: 1, content: 'Giỏ hàng' },
    { number: 2, content: 'Thanh toán' },
    { number: 3, content: 'Trạng thái đơn hàng' },
  ];

  return (
    <div className={containerSteps}>
      <div className={steps}>
        {dataSteps.map((item, index) => {
          return (
            <>
              <Stepper
                number={item.number}
                content={item.content}
                key={index}
                isDisabled={index >= currentStep}
              />
              {index !== dataSteps.length - 1 && <div className={line}></div>}
            </>
          );
        })}
      </div>

      <div className={textNoti}>
        Bạn sắp hết thời gian! Thanh toán ngay để tránh mất đơn hàng!
      </div>
    </div>
  );
}

export default Steps;
