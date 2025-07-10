import Profile from "../models/user.profile.model.js";
import Item from "../models/items.js";
import Address from "../models/savedAddress.js";

export const createProfile = async (customerId,Customer) => {
  const isProfile = await Profile.findOne({ userId: customerId });
  console.log("profile already exists");
  if (!isProfile) {
    const personalInformation = {
      firstName: Customer.firstname,
      lastName: Customer.lastname,
      contact: Customer.contact,
    };
    const savedAddressProfile={
      ...personalInformation,
    }
    const newProfile = new Profile({
      userId: customerId,
      personalInfo: personalInformation,
    });
    const ProfileCreated = await newProfile.save();
    console.log( "profileCrated");
  }
};

export const cartTotal = async (items) => {
  
  const cartData = await Promise.all(
    items.map(async (element) => {
      const Order = await Item.findById(element.itemId);
      const price = Order.price * element.quantity;
      return price;
    })
  );
  const finalCartTotal = cartData.reduce((acc, curr) => (acc = acc + curr), 0);
  
  return finalCartTotal
};

export const saveAddressDb=async(customer,userAddress,customerId,isDefault)=>{
  // console.log(userAddress.house)
  const addressData={
    name:customer.firstname,
    contact:customer.contact,
    email:customer.email,
    houseNumber:userAddress.house,
    street:userAddress.streetAddress,
    pincode:userAddress.pincode,
    state:userAddress.state,
    city:userAddress.city,
    country:userAddress.country,
    user:customerId,
    isDefault:isDefault
  }
  const newAddress=new Address(addressData)
  const address=await newAddress.save()
  // console.log(address)

}

export const getPincodeInfo=async(pincode)=>{
  const res=await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
  const resInfo=await res.json()
  return resInfo
}