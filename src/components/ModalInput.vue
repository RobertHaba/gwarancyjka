<template>
  <div
    class="modal-form-group"
    :class="{ 'modal-form-group--textarea': inputData.type === 'textarea' }"
  >
    <label :for="inputData.id" class="modal-form-group__title">{{
      inputData.title
    }}</label>
    <input
      :type="inputData.type"
      :placeholder="inputData.placeholder"
      :minlength="inputData.validation.options.minLength"
      :maxlength="inputData.validation.options.maxLength"
      :step="inputData.validation.options.step"
      :required="inputData.isRequired"
      :accept="inputData.validation.acceptImg"
      :id="inputData.id"
      v-model="inputValue"
      class="modal-form-group__input"
      v-if="inputData.type != 'textarea'"
    />
    <textarea
      :type="inputData.type"
      :placeholder="inputData.placeholder"
      :minlength="inputData.validation.options.minLength"
      :maxlength="inputData.validation.options.maxLength"
      :required="inputData.isRequired"
      :accept="inputData.validation.acceptImg"
      @keypress.enter="onKeyEnterLimitLines"
      :id="inputData.id"
      v-model="inputValue"
      class="modal-form-group__textarea"
      v-else-if="inputData.type == 'textarea'"
    >
    </textarea>
    <small
      class="modal-form-group__text"
      v-show="inputData.validation.launched && !inputData.validation.isValid"
      >{{ inputData.validation.text }}</small
    >
    <div
      class="modal-from-group__image-preview"
      v-if="inputData.type === 'file' && inputData.logoURL"
    >
      <img class="image-preview" :src="inputData.logoURL" alt="Firmowe logo" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    inputProp: Object,
  },
  data() {
    return {
      inputData: this.inputProp,
      inputValue: this.inputProp.value,
      logoURL: null,
    };
  },
  methods: {
    validationConfiguration() {
      if (
        this.inputData.type === 'text' ||
        this.inputData.type === 'textarea'
      ) {
        this.defaultTextValidation();
      } else if (this.inputData.type === 'number') {
        this.defaultNumberValidation();
      } else if (this.inputData.type === 'date') {
        this.defaultDateValidation();
      } else if (this.inputData.validation.regex) {
        this.validationByRegex();
      } else if (this.inputData.type === 'file') {
        this.defaultImageValidation();
      } else if (this.inputData.type === 'checkbox') {
        this.inputData.value = this.inputValue;
      }
    },
    defaultTextValidation() {
      this.inputData.validation.launched = true;

      if (
        this.inputValue.length >= this.inputData.validation.options.minLength &&
        this.inputValue.length <= this.inputData.validation.options.maxLength
      ) {
        this.inputData.validation.isValid = true;
        this.inputData.value = this.inputValue;
      } else {
        this.inputData.validation.isValid = false;
        this.inputData.value = '';
      }
    },
    defaultNumberValidation() {
      this.inputData.validation.launched = true;
      let inputNumber =
        this.inputData.id === 'warrantyInputPrice'
          ? parseFloat(this.inputValue)
          : parseInt(this.inputValue);
      if (
        inputNumber >= this.inputData.validation.options.minLength &&
        inputNumber <= this.inputData.validation.options.maxLength
      ) {
        this.inputData.validation.isValid = true;
        this.inputData.value = inputNumber;
      } else {
        this.inputData.validation.isValid = false;
        this.inputData.value = '';
      }
    },
    defaultDateValidation() {
      const dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;
      this.inputData.validation.launched = true;
      if (dateRegex.test(this.inputValue)) {
        this.inputData.validation.isValid = true;
        this.inputData.value = this.inputValue;
      } else {
        this.inputData.validation.isValid = false;
        this.inputData.value = '';
      }
    },
    defaultImageValidation() {
      const imageInput = document.getElementById('brandInputLogo');
      if (imageInput.files.length) {
        if (imageInput.files[0].size / 1024 / 1024 < 1) {
          this.inputData.validation.isValid = true;
          this.inputData.validation.launched = true;
          this.inputData.value = imageInput.files[0];
          this.inputData.logoURL = URL.createObjectURL(imageInput.files[0]);
        } else {
          this.inputData.validation.isValid = false;
          this.inputData.validation.launched = true;
          this.inputData.value = '';
        }
      }
    },
    validationByRegex() {
      const dateRegex = this.inputData.validation.regex;
      this.inputData.validation.launched = true;
      if (dateRegex.test(this.inputValue)) {
        this.inputData.validation.isValid = true;
        this.inputData.value = this.inputValue;
      } else {
        this.inputData.validation.isValid = false;
        this.inputData.value = '';
      }
    },
    onKeyEnterLimitLines(evt) {
      if (this.inputValue.includes('\n')) {
        evt.preventDefault();
        return;
      }
    },
  },
  watch: {
    inputValue: function () {
      this.validationConfiguration();
    },
  },
};
</script>

<style scoped>
.modal-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 82px;
  width: 100%;
  max-width: 330px;
  padding-right: 1rem;
}
.modal-form-group--textarea {
  height: calc(110px);
}
.modal-form-group__title {
  font-weight: bold;
}
.modal-form-group__input,
.modal-form-group__textarea {
  padding: 0.5rem 1rem;
  background-color: rgba(0, 0, 0, 0);
  color: var(--main-text);
  border: 1px dashed var(--main-purple);
  border-radius: 10px;
}
.modal-form-group__textarea {
  resize: none;
  height: 40px;
}
.modal-form-group__input::placeholder,
.modal-form-group__textarea::placeholder {
  color: var(--main-text);
  opacity: 0.6;
}
.modal-form-group__text {
  font-size: 0.7rem;
  opacity: 0.6;
}
input[type='date']::-webkit-calendar-picker-indicator {
  background: url('../assets/icons/calendar.svg') no-repeat center;
  background-size: 70%;
}
.modal-from-group__image-preview {
  display: flex;
  justify-content: center;
  max-width: 100%;
  max-height: 100px;
  padding-top: 0.5rem;
}
.image-preview {
  width: auto;
  height: 100%;
}
@media screen and (max-width: 740px) {
  .modal-form-group {
    padding-right: 0;
  }
}
</style>
