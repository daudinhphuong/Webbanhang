import styles from './styles.module.scss';

function InputCustom({
  label,
  type,
  dataOptions,
  isRequired = false,
  register,
  isShowlabel = true,
  isError = false,
}) {
  const { container, labelCLS, error } = styles;

  const renderInput = () => {
    if (type === 'text') {
      return (
        <input
          type="text"
          className={isError ? error : ''}
          placeholder={label}
          {...register}
        />
      );
    } else {
      return (
        <select {...register} className={isError ? error : ''}>
          <option value="" selected disabled hidden>
            {label}
          </option>
          {dataOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      );
    }
  };

  return (
    <div className={container}>
      {isShowlabel && (
        <label className={labelCLS}>
          {label} {isRequired && <span>*</span>}
        </label>
      )}

      {renderInput()}
    </div>
  );
}

export default InputCustom;
