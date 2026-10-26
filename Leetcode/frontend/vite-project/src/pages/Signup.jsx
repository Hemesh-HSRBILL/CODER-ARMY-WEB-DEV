import { useEffect,useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; // resolver before using zod
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link} from "react-router";
import { registerUser } from "../slice/authSlice";

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailid: z.string().email("Invalid email id"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character")
});

function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: zodResolver(signupSchema) }); // apply signupSchema on regsiter output html form field data
  
  const [showPassword, setShowPassword] = useState(false); // use for eye icon svg in password

  const { isAuthenticated,loading} = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => dispatch(registerUser(data));

  return (
    /* JSX comments stay out of the rendered page. */
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* min-h-screen: Minimum height = full screen. */}
      {/* flex: Enable flexbox layout. */}
      {/* items-center: Vertically center items. */}
      {/* justify-center: Horizontally center items. */}
      {/* p-4: Padding of 1rem (16px). */}
      <div className="card w-96 bg-base-100 shadow-xl">
        {/* card: DaisyUI card component. */}
        {/* w-96: Fixed width = 24rem. */}
        {/* bg-base-100: Background color from theme. */}
        {/* shadow-xl: Extra large shadow. */}
        <div className="card-body">
          <h2 className="card-title justify-center text-3xl">
            {/* card-title, justify-center, text-3xl: Title styling. */}
            ApexX
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-control">
              {/* form-control: DaisyUI form control wrapper. */}
              <label className="label mb-1">
                {/* label and mb-1: Label styling and spacing. */}
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                placeholder="John"
                className={`input input-bordered ${errors.firstName ? "input-error" : ""}`}
                {...register("firstName")}
              />
              {/* input, input-bordered, input-error: Input styling. */}
              {errors.firstName && <span className="text-error">{errors.firstName.message}</span>}
            </div>

            <div className="form-control mt-4">
              {/* form-control and mt-4: Form wrapper and spacing. */}
              <label className="label mb-1">
                {/* label and mb-1: Label styling and spacing. */}
                <span className="label-text">Email ID</span>
              </label>
              <input
                type="email"
                placeholder="John123@gmail.com"
                className={`input input-bordered ${errors.emailid ? "input-error" : ""}`}
                {...register("emailid")}
              />
              {/* input, input-bordered, input-error: Input styling. */}
              {errors.emailid && <span className="text-error">{errors.emailid.message}</span>}
            </div>

            <div className="form-control mt-3">
              {/* form-control and mt-4: Form wrapper and spacing. */}
              <label className="label mt-4">
                {/* label and mt-4: Label styling and spacing. */}
                <span className="label-text">Password</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  // Added pr-10 (padding-right) to make space for the button
                  className={`input input-bordered w-full pr-10 ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" // Added transform for better centering, styling
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"} // Accessibility and use of screen readers or do screen rendring  if someone is blind and uses a screen reader, the software will read out loud whatever text you put in aria-label.
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-error text-sm mt-1">{errors.password.message}</span>
              )}
            </div>

            <div className="form-control mt-6 flex justify-center">
              {/* form-control, mt-6, flex, justify-center: Button layout. */}
              <button type="submit" className="btn btn-primary">Sign Up</button>
            </div>
            
            <div className="form-control mt-6 flex justify-center">
              <h2>
                <span className='text-sm'>If you are already have account{" "}</span>
                <Link to="/login" className="text-blue-500 underline">Login</Link>
                </h2>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
