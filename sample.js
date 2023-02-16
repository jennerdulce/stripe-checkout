
import React, { useEffect, useState } from "react"
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js"
import { useDispatch, useSelector } from 'react-redux'
import { paymentSucessStatus } from 'ControlActions/CourseListAction'
import InputBase from '@material-ui/core/InputBase'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import {
  alpha,
  withStyles,
  makeStyles,
} from '@material-ui/core/styles'
import { useForm } from 'react-final-form'

const BootstrapInput = withStyles((theme) => ({
  root: {
    'label + &': {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: theme.palette.common.white,
    border: '1px solid #ced4da',
    fontSize: 16,
    width: 'auto',
    padding: '10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.primary.main,
    },
  },
}))(InputBase)

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  margin: {
    margin: theme.spacing(1),
  },
  inputLabel: {
    fontSize: '18px'
  }
}))

export default function CheckoutForm() {
  const dispatch = useDispatch()
  const classes = useStyles()
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const stripePaymentSucceeded = useSelector(state => state.addForm.formSuccessStatus)
  const form = useForm()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    setIsLoading(true)

    const paymentConfirmation = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: "http://localhost:3000/",
      },
      redirect: "if_required" // Cancels redirect
    })
    console.log('Payment Confirmation: ')
    console.log(paymentConfirmation)
    if (paymentConfirmation.error){
      // TODO: Display a message somewhere on form
      setMessage(paymentConfirmation.error.message)
    } else {
      if (paymentConfirmation.paymentIntent.status === "succeeded") {
        // Change redux state here
        dispatch(paymentSucessStatus())
        setMessage("You payment was successful!")
      }
    }
    setIsLoading(false)
  }

  const handleChange = (e) => {
    form.change(`recording.customerInformation[${e.target.name}]`, `${e.target.value}`)
  }

  return (
    <>
      <form id="payment-form" onSubmit={handleSubmit}>
        {/* These From controls for the fullname, email, and organization have no funcionality just yet
        Note: These form controls are unable to be utilized on the same page as the credit card input.
        TODO: 
        */}
        <FormControl className={classes.margin}>
          <InputLabel className={classes.inputLabel}shrink htmlFor="bootstrap-input">
            Full Name
          </InputLabel>
          <BootstrapInput onChange={(e) => handleChange(e)} placeholder="John Doe" name="fullName" />
        </FormControl>
        <FormControl className={classes.margin}>
          <InputLabel className={classes.inputLabel}shrink htmlFor="bootstrap-input">
            E-mail Address
          </InputLabel>
          <BootstrapInput onChange={(e) => handleChange(e)} placeholder="example@website.com" name="email" />
        </FormControl>
        <FormControl className={classes.margin}>
          <InputLabel className={classes.inputLabel}shrink htmlFor="bootstrap-input">
            Organization Name
          </InputLabel>
          <BootstrapInput onChange={(e) => handleChange(e)} placeholder="Some Company Name" name="organization" />
        </FormControl>
        <PaymentElement id="payment-element"/>
        <button disabled={isLoading || !stripe || !elements || stripePaymentSucceeded} id="submit">
          <span id="button-text">
            {stripePaymentSucceeded ? "Payment Accepted" : 
              isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
          </span>
        </button>
        {/* Show any error or success messages */}
        {message && <div style={{'color': 'red'}}id="payment-message">{message}</div>}
      </form>
    </>
  )
}
