import React, { useState } from 'react'
import CreditScoreIntro from '../CreditScore/Intro';

const HandleInstallmentCreditWizard = () => {

    const [step, setStep] = useState(1);

    const renderRequestCreditStep = () => {
        switch(step) {
            case 1:
                return <CreditScoreIntro />
        }
    }

  return (
    <>

    </>
  )
}

export default HandleInstallmentCreditWizard
