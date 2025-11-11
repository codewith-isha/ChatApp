import React, { useDebugValue, useState } from "react";
import useLoginStore from "../../store/useLoginStore";
import countries from "../../utils/countriles";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useNavigation } from "react-router-dom";
import { useForm } from "react-hook-form";
import useThemeStore from "../../store/themeStore";
import useUserStore from "../../store/useUserStore";
import { motion } from "framer-motion";
import { FaChevronDown, FaUser, FaWhatsapp } from "react-icons/fa6";
import Spinner from "../../utils/Spinner"
import { toast } from "react-toastify";

const loginValidationSchema = yup
  .object()
  .shape({
    phoneNumber: yup
      .string()
      .nullable()
      .notRequired()
      .matches(/^\d+$/, "Phone number be digit")
      .transform((value, originalValue) =>
        originalValue.trim() === "" ? null : value
      ),
    email: yup
      .string()
      .nullable()
      .notRequired()
      .email("Please enter valid email")
      .transform((value, originalValue) =>
        originalValue.trim() === "" ? null : value
      ),
  })
  .test(
    "at-least-one",
    "Either email or phone number is required",
    function (value) {
      return !!(value.phoneNumber || value.email);
    }
  );

const otpValidationSchema = yup.object().shape({
  otp: yup
    .string()
    .length(6, "Otp must be excatly 6 digits")
    .required("Otp is required"),
});
const profileValidationSchema = yup.object().shape({
  username: yup.string().required("username is required"),
  agreed: yup.bool().oneOf([true], "You must agree to the terms"),
});

const avatars = [
  `https://api.dicebear.com/6.x/avataaars.svg?seed=Felix`,
  `https://api.dicebear.com/6.x/avataaars.svg?seed=Aneka`,
  `https://api.dicebear.com/6.x/avataaars.svg?seed=Mimi`,
  `https://api.dicebear.com/6.x/avataaars.svg?seed=Jasper`,
  `https://api.dicebear.com/6.x/avataaars.svg?seed=Luna`,
  `https://api.dicebear.com/6.x/avataaars.svg?seed=Zoe`,
];

const login = () => {
  const { step, setStep, setUserPhoneData, UserPhoneData, resetLoginState } =
    useLoginStore();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries);
  const [showDropDown, setShowDropDown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [otp, setOtp] = useState("", "", "", "", "", "");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const { theme, setTheme } = useThemeStore();
  const [loading , setLoading] = useState(false)

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: yupResolver(loginValidationSchema),
  });

  const {
    handleSubmit: hanldeOtpSubmit,
    formState: { errors: otpErrors },
    setValue: setOtpValue,
  } = useForm({
    resolver: yupResolver(otpValidationSchema),
  });

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    watch,
  } = useForm({
    resolver: yupResolver(profileValidationSchema),
  });

  const filterCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm)
  );

  const onLoginSubmit  = async()=>{
    try {
      setLoading(true);
      if(email){
        const response = await sendOtp(null,null,email);
        if(response.status === "success") {
          toast.info("OTP is Send to your email");
          setUserPhoneData({email});
          setStep(2)
        }
      }else{
        const response = await sendOtp(phoneNumber,selectedCountry,dialCode)
                if(response.status === "success") {
          toast.info("OTP is Send to your phoneNumber");
          setUserPhoneData({phoneNumber,phoneSuffix:selectedCountry.dialCode});
          setStep(2)
        }
      }
    } catch (error) {
      console.log(error)
      setError(error.message || 'Failed to send OTP') 
    }finally{
      setLoading(false)
    }
  }


const onOtpSubmit = async()=>{
  try {
    setLoading(true)
    if(!UserPhoneData){
      throw new Error("Phone or email data is missing")
    }
    const otpString = otp.join("")
    let response;
    if(UserPhoneData?.email){
      response= await verifyOtp(null , null ,otpString, UserPhoneData.email)
    }else{
      response = await verifyOtp(UserPhoneData.phoneNumber,UserPhoneData.phoneSuffix,otpString)
    }
    if(response.status === "success"){
      toast.success(
        "OTP Verify Successfully"
      )
      const user = response.data?.user;
      if(user?.username && user?.profilePicture){
        setUser(user);
        toast.success("Welcome back to Whatsapp");
        navigate('/')
        resetLoginState()
      }else{
        setStep(3)
      }
    }
  } catch (error) {
    console.log(error)
      setError(error.message || 'Failed to send OTP') 
    }finally{
      setLoading(false)
    
  }
}

const handleChnage = (e) =>{
  const file = e.target.files[0];
  if(file){
    setProfilePictureFile(file);
    setProfilePicture(URL.createObjectURL(file))
  }
}
 
const  onProfileSubmit = async(data)=>{
  try {
    setLoading(true)
    const formData = new FormData()
    formData.append("username",data.username)
    formData.append("agreed",data.agreed)
    if(profilePictureFile){
      formData.append('media',profilePictureFile)
    }else{
      formData.append("profilePicture",selectedAvatar)
    }
    await updateUserProfile(formData);
    toast.success("Welcome back to Whatsapp")
    navigate('/')
    resetLoginState()
  } catch (error) {
     console.log(error)
      setError(error.message || 'Failed to update user profile') 
    }finally{
      setLoading(false)
    
  }
}
const handleOtpChange = (index,value) =>{
  const  newOtp = {...otp};
  newOtp[index] = value;
  setOtp(newOtp);
  setOtpValue("otp",newOtp.join(""));
  if(value && index <5){
    document.getElementById(`otp-${index +1}`).focus();
  }
}

  const ProgressBar = () => (
    <div
      className={`w-full ${
        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
      } rounded-full h-2.5 mb-6`}
    >
      <div
        className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${(step / 3) * 100}%` }}
      ></div>
    </div>
  );



const  handleBack = () =>{
  setStep(1);
  setUserPhoneData(null);
  setOtp(["","","","","",""]);
  setError("")
}




  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gray-900"
          : "bg-linear-to-br from-green-400 to-blue-500"
      } flex items-center justify-center p-4 overflow-hidden`}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
        } p-6 md:p-8 rounded-lg shadow-2xl w-full max-w-md relative z-10`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.2,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <FaWhatsapp className="w-16 h-16 text-white" />
        </motion.div>

        <h1
          className={`text-3xl font-bold text-center mb-6 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          Whatsapp Login
        </h1>
        <ProgressBar />
        {error && <p className="text-red-500 text-center mb-4"></p>}

        {step === 1 && (
          <form className="space-y-4">
            <p
              className={`text-center${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }mb-4`}
            >
              Enter Your Phone Number and OTP
            </p>
            <div className="relative">
              <div className="flex">
                <div className="relative w-1/3">
                  <button
                    type="button"
                    className={`shrink-0 z-10 inline-flex items-center px-4 text-sm font-medium text-center ${
                      theme === "dark"
                        ? "text-white bg-gray-700 border-gray-600"
                        : "text-gray-900 border-gray-300"
                    } border rounded-s-lg hover:bg-gray-200 focus:outline-none focus:ring-gray-100`}
                    onClick={() => setShowDropDown(!showDropDown)}
                  >
                    <span>
                      {selectedCountry.flag} {selectedCountry.dialCode}
                    </span>
                    <FaChevronDown className={"ml-2"} />
                  </button>
                  {showDropDown && (
                    <div
                      className={`absolute z-10 w-full mt-1 $ ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-300"
                      } border rounded-md shadow-lg max-h-60 overflow-auto`}
                    >
                      <div
                        className={`sticky top-0 ${
                          theme === "dark" ? "bg-gray-700" : "bg-white"
                        } py-2`}
                      >
                        <input
                          type="text"
                          placeholder="Search Contries..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`w-full px-2 py-1 border ${
                            theme === "dark"
                              ? "bg-gray-600 border-gray-500 text-white"
                              : "bg-white border-gray-300"
                          }rounded-md text-sm focus:outline-none foucs:right-2 focus:ring-green-500`}
                        />
                      </div>
                      {filterCountries.map((country) => (
                        <button
                          key={country.alpha2}
                          type="button"
                          className={`w-full text-left px-3 py-2 ${
                            theme === "dark"
                              ? "hover:bg-gray-600"
                              : "hover:bg-gray-100"
                          } focus:outline-none focus:bg-gray-100`}
                          onClick={() => {
                            setSelectedCountry(country);
                            setShowDropDown(false);
                          }}
                        >
                          {country.flag} ({country.dialCode}) {country.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  {...loginRegister("phoneNumber")}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone Number"
                  className={`w-2/3 px-4 py-2 border ${
                    theme === "dark"
                      ? "bg-gray-700  border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }rounded-md focus:outline-none focus:right-2 focus:ring-green-500 ${
                    loginErrors.phoneNumber ? "border-red-500" : ""
                  }`}
                />
              </div>
              {loginErrors.phoneNumber && (
                <p className="text-red-500 text-sm">
                  {loginErrors.phoneNumber.message}
                </p>
              )}
            </div>
            {/* divider with or  */}
            <div className="flex items-center my-4">
              <div className="grow h-px bg-gray-300" />
              <span className="mx-3 text-gray-500 text-sm font-medium">or</span>
              <div className="grow h-px bg-gray-300" />
            </div>

            {/* email input box  */}
            <div
              className={`flex items-center border rounded-md px-3 py-2 ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
            >
              <FaUser
                className={`mr-2 text-gray-400 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="email"
                {...loginRegister("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className={`w-full bg-transparent focus:outline-none ${
                  theme === "dark"
                    ? " text-white"
                    : "bg-black "
                } ${
                  loginErrors.email ? "border-red-500" : ""
                }`}
              />
               {loginErrors.email && (
                <p className="text-red-500 text-sm">
                  {loginErrors.phoneNumber.message}
                </p>
              )}


            </div>
            <button className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition" type="submit">
              {loading ? <Spinner/>:"Send OTP"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default login;
