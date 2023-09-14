"use client";

import styles from "./page.module.scss";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button, Loader } from "@mantine/core";
import { useRouter } from "next/navigation";
import fetchSession from "../_api/fetchSession";
import Link from "next/link";
import { motion } from "framer-motion";
import fetchReferralCodes from "../_api/fetchReferralCodes";
import { getHashes } from "../_utils/textHandling";

export default function AccountPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [availableReferralCodes, setAvailableReferralCodes] = useState(null);
  const [usedReferralCodes, setUsedReferralCodes] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const session = await fetchSession();

      if (session.data.session) {
        setSession(session.data.session);
        fetchReferralData(session);
      } else {
        router.push("/account/login");
      }
    }

    async function fetchReferralData(session) {
      const uid = session.data.session.user.id;

      const referralCodes = await fetchReferralCodes(uid);

      if (referralCodes) {
        setAvailableReferralCodes(referralCodes.available_codes);
        setUsedReferralCodes(referralCodes.used_codes);
      } else {
        const hashes = getHashes(10);
        const { data, error } = await supabase
          .from("_referral_codes")
          .insert([{ auth_uid: uid, available_codes: hashes, used_codes: [] }]);

        if (error) {
          console.log(error);
        }

        fetchReferralCodes(uid);
      }
    }

    checkSession();
  }, []);

  async function handleLogOut() {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    router.push("/account/login");
    router.refresh();
    setLoading(false);
  }

  return (
    <motion.div
      className={styles.account}
      initial={{ opacity: 0, y: 50 }}
      animate={{
        opacity: [0, 1],
        y: [50, 0],
      }}
      transition={{
        duration: 0.2,
        delay: 0.1,
      }}
    >
      <div className={`${styles.side} ${styles.left}`}>
        <Link
          href="https://www.anthias.xyz/"
          rel="noreferrer"
          target="_blank"
          style={{ textDecoration: "none" }}
          className={styles.anthiasLogo}
        >
          <svg
            width="978"
            height="265"
            viewBox="0 0 978 265"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M413.889 134.487C413.889 127.637 411.821 122.597 407.686 119.366C403.55 116.006 398.058 114.326 391.208 114.326C386.039 114.326 381.128 115.36 376.475 117.428C371.952 119.366 368.14 121.886 365.038 124.988L355.345 113.357C359.868 109.092 365.361 105.732 371.823 103.277C378.414 100.821 385.457 99.5933 392.953 99.5933C399.544 99.5933 405.23 100.563 410.012 102.501C414.923 104.31 418.929 106.83 422.031 110.061C425.132 113.292 427.459 117.105 429.01 121.499C430.56 125.893 431.336 130.61 431.336 135.65V175.778C431.336 178.879 431.4 182.175 431.53 185.664C431.788 189.024 432.176 191.803 432.693 194H416.215C415.181 189.606 414.664 185.212 414.664 180.818H414.083C410.723 185.729 406.458 189.541 401.288 192.255C396.248 194.969 390.239 196.326 383.26 196.326C379.641 196.326 375.829 195.809 371.823 194.775C367.946 193.871 364.392 192.32 361.161 190.123C357.93 187.926 355.216 185.018 353.019 181.4C350.951 177.781 349.917 173.322 349.917 168.024C349.917 161.045 351.791 155.552 355.539 151.546C359.287 147.411 364.198 144.309 370.272 142.241C376.346 140.044 383.195 138.622 390.82 137.976C398.445 137.33 406.135 137.007 413.889 137.007V134.487ZM409.43 150.189C404.907 150.189 400.19 150.383 395.279 150.771C390.497 151.158 386.103 151.934 382.097 153.097C378.22 154.26 374.989 156.005 372.404 158.331C369.82 160.657 368.527 163.759 368.527 167.636C368.527 170.35 369.044 172.611 370.078 174.421C371.241 176.23 372.727 177.716 374.537 178.879C376.346 180.043 378.349 180.883 380.546 181.4C382.743 181.787 385.005 181.981 387.331 181.981C395.861 181.981 402.387 179.461 406.91 174.421C411.563 169.251 413.889 162.79 413.889 155.035V150.189H409.43ZM478.247 102.113C478.505 104.44 478.699 107.089 478.828 110.061C478.958 112.905 479.022 115.295 479.022 117.234H479.604C480.767 114.778 482.318 112.517 484.256 110.449C486.324 108.252 488.65 106.378 491.235 104.827C493.82 103.147 496.663 101.855 499.765 100.95C502.866 100.046 506.097 99.5933 509.457 99.5933C515.402 99.5933 520.507 100.627 524.772 102.695C529.036 104.633 532.59 107.283 535.434 110.643C538.277 114.003 540.345 117.945 541.637 122.468C543.059 126.991 543.769 131.838 543.769 137.007V194H525.547V143.017C525.547 139.269 525.224 135.715 524.578 132.355C524.061 128.994 523.027 126.022 521.476 123.437C519.925 120.853 517.793 118.785 515.079 117.234C512.365 115.683 508.876 114.908 504.611 114.908C497.374 114.908 491.429 117.686 486.776 123.243C482.253 128.671 479.992 135.973 479.992 145.149V194H461.769V121.886C461.769 119.431 461.705 116.265 461.575 112.388C461.446 108.511 461.252 105.086 460.994 102.113H478.247ZM619.572 117.04H595.147V164.922C595.147 170.479 596.18 174.485 598.248 176.941C600.316 179.267 603.612 180.43 608.135 180.43C609.815 180.43 611.624 180.236 613.563 179.849C615.501 179.461 617.246 178.879 618.797 178.104L619.378 193.031C617.181 193.806 614.726 194.388 612.012 194.775C609.427 195.292 606.713 195.551 603.87 195.551C595.211 195.551 588.556 193.16 583.903 188.378C579.38 183.597 577.118 176.424 577.118 166.86V117.04H559.478V102.113H577.118V75.7493H595.147V102.113H619.572V117.04ZM657.393 116.071C659.59 111.548 663.338 107.671 668.637 104.44C673.935 101.209 679.88 99.5933 686.471 99.5933C692.416 99.5933 697.521 100.627 701.786 102.695C706.051 104.633 709.605 107.283 712.448 110.643C715.291 114.003 717.359 117.945 718.651 122.468C720.073 126.991 720.783 131.838 720.783 137.007V194H702.561V143.21C702.561 139.463 702.238 135.909 701.592 132.548C701.075 129.188 700.041 126.216 698.49 123.631C696.939 121.046 694.807 118.979 692.093 117.428C689.508 115.877 686.084 115.102 681.819 115.102C674.582 115.102 668.637 117.88 663.984 123.437C659.332 128.865 657.006 136.167 657.006 145.343V194H638.783V47.4467H657.006V116.071H657.393ZM770.019 194H751.797V102.113H770.019V194ZM773.121 68.9644C773.121 72.3246 771.893 75.1031 769.438 77.3001C767.111 79.4971 764.268 80.5956 760.908 80.5956C757.548 80.5956 754.705 79.4971 752.379 77.3001C750.052 74.9739 748.889 72.1953 748.889 68.9644C748.889 65.6043 750.052 62.8257 752.379 60.6287C754.705 58.3025 757.548 57.1394 760.908 57.1394C764.268 57.1394 767.111 58.3025 769.438 60.6287C771.893 62.8257 773.121 65.6043 773.121 68.9644ZM858.957 134.487C858.957 127.637 856.889 122.597 852.754 119.366C848.618 116.006 843.126 114.326 836.276 114.326C831.107 114.326 826.196 115.36 821.543 117.428C817.02 119.366 813.208 121.886 810.106 124.988L800.413 113.357C804.937 109.092 810.429 105.732 816.891 103.277C823.482 100.821 830.525 99.5933 838.021 99.5933C844.612 99.5933 850.298 100.563 855.08 102.501C859.991 104.31 863.997 106.83 867.099 110.061C870.201 113.292 872.527 117.105 874.078 121.499C875.629 125.893 876.404 130.61 876.404 135.65V175.778C876.404 178.879 876.469 182.175 876.598 185.664C876.856 189.024 877.244 191.803 877.761 194H861.283C860.249 189.606 859.733 185.212 859.733 180.818H859.151C855.791 185.729 851.526 189.541 846.357 192.255C841.316 194.969 835.307 196.326 828.328 196.326C824.71 196.326 820.897 195.809 816.891 194.775C813.014 193.871 809.46 192.32 806.229 190.123C802.998 187.926 800.284 185.018 798.087 181.4C796.019 177.781 794.985 173.322 794.985 168.024C794.985 161.045 796.859 155.552 800.607 151.546C804.355 147.411 809.266 144.309 815.34 142.241C821.414 140.044 828.264 138.622 835.889 137.976C843.513 137.33 851.203 137.007 858.957 137.007V134.487ZM854.498 150.189C849.975 150.189 845.258 150.383 840.347 150.771C835.565 151.158 831.171 151.934 827.165 153.097C823.288 154.26 820.057 156.005 817.472 158.331C814.888 160.657 813.595 163.759 813.595 167.636C813.595 170.35 814.112 172.611 815.146 174.421C816.309 176.23 817.796 177.716 819.605 178.879C821.414 180.043 823.417 180.883 825.614 181.4C827.811 181.787 830.073 181.981 832.399 181.981C840.929 181.981 847.455 179.461 851.978 174.421C856.631 169.251 858.957 162.79 858.957 155.035V150.189H854.498ZM956.464 125.376C954.396 122.016 951.488 119.302 947.741 117.234C943.993 115.037 939.793 113.938 935.14 113.938C933.072 113.938 931.005 114.197 928.937 114.714C926.869 115.102 924.995 115.812 923.315 116.846C921.764 117.751 920.472 118.979 919.438 120.529C918.533 121.951 918.081 123.76 918.081 125.957C918.081 129.834 919.826 132.742 923.315 134.681C926.804 136.49 932.038 138.17 939.017 139.721C943.411 140.755 947.482 141.983 951.23 143.404C954.978 144.826 958.209 146.635 960.923 148.832C963.766 150.9 965.963 153.42 967.514 156.392C969.064 159.365 969.84 162.854 969.84 166.86C969.84 172.288 968.806 176.876 966.738 180.624C964.67 184.372 961.892 187.474 958.403 189.929C955.042 192.255 951.165 193.935 946.771 194.969C942.377 196.003 937.854 196.52 933.202 196.52C926.223 196.52 919.373 195.163 912.653 192.449C906.062 189.735 900.57 185.6 896.176 180.043L909.164 168.993C911.619 172.611 914.979 175.649 919.244 178.104C923.638 180.559 928.42 181.787 933.589 181.787C935.915 181.787 938.113 181.593 940.18 181.206C942.377 180.689 944.316 179.913 945.996 178.879C947.805 177.846 949.227 176.489 950.261 174.808C951.295 173.128 951.811 170.996 951.811 168.411C951.811 164.147 949.744 160.98 945.608 158.912C941.602 156.845 935.657 154.906 927.774 153.097C924.672 152.321 921.506 151.417 918.275 150.383C915.173 149.22 912.33 147.669 909.745 145.73C907.161 143.792 905.028 141.401 903.348 138.558C901.797 135.585 901.022 131.967 901.022 127.702C901.022 122.791 901.991 118.591 903.93 115.102C905.997 111.483 908.647 108.575 911.878 106.378C915.109 104.052 918.792 102.372 922.927 101.338C927.063 100.175 931.328 99.5933 935.722 99.5933C942.313 99.5933 948.645 100.886 954.719 103.47C960.923 106.055 965.704 109.803 969.064 114.714L956.464 125.376Z" />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M63.6389 20.7943C61.1607 23.5178 61.1648 23.7141 63.7594 28.5081C66.7718 34.075 83.208 52.0324 89.1342 56.2307L93.0466 59.0019L98.707 55.2752L104.367 51.5471L100.473 48.7964C98.3303 47.2834 92.8795 42.5071 88.3588 38.182L80.1394 30.3197L115.072 30.3524L150.004 30.3851L140.514 39.2684C131.604 47.6064 121.921 55.2752 104.367 67.9362C95.7028 74.9525 63.3512 100.909 54.5455 112.908L48.4165 121.26L43.7301 114.365C37.0518 104.543 19.6266 87.2098 12.0593 82.8629C6.82486 79.8545 5.10152 79.4442 2.81241 80.6629C0.0547961 82.1323 0 83.1273 0 131.769C0 175.049 0.273981 181.651 2.15212 183.519C3.33709 184.697 5.11796 185.661 6.11114 185.661C9.21945 185.661 23.5952 174.256 32.5832 164.661L41.1944 155.47L38.1861 150.459C33.6668 142.93 33.5928 142.913 29.7228 148.469C27.7447 151.311 23.0212 156.677 19.2266 160.396L12.3291 167.157V133.357C12.3291 106.93 12.7031 99.6808 14.0415 100.117C17.3676 101.201 34.3791 122.117 41.3629 133.708C45.2548 140.166 51.1125 148.944 54.3811 153.215C62.0388 163.22 80.1462 180.938 92.837 190.839L102.795 198.61L98.3851 202.018C85.019 212.346 76.2105 220.695 70.0007 228.92C62.5758 238.757 61.7553 241.462 65.1677 244.859C67.0431 246.723 73.5049 247 115.26 247C145.685 247 164.167 246.485 165.849 245.589C171.835 242.401 167.494 233.59 152.225 217.937C140.18 205.591 139.518 205.285 132.845 209.017C129.85 210.691 127.405 212.409 127.411 212.833C127.416 213.257 129.419 214.96 131.863 216.618C134.307 218.276 139.675 223.029 143.793 227.182L151.281 234.732H116.706H82.1312L84.3066 231.428C87.7506 226.199 104.522 212.889 117.379 205.182C123.857 201.298 133.871 194.427 139.633 189.909C149.699 182.021 170.7 159.744 177.611 149.622C179.434 146.952 181.127 144.768 181.374 144.768C181.619 144.768 184.984 149 188.849 154.175C196.863 164.897 212.373 179.694 219.731 183.638C223.56 185.689 225.253 185.959 227.082 184.812C229.255 183.447 229.49 179.072 229.833 133.715C230.205 84.4945 230.185 84.091 227.282 81.7233C224.478 79.4347 224.131 79.462 218.912 82.3817C212.331 86.0621 199.024 97.8678 193.178 105.211L188.921 110.56L192.624 116.128L196.328 121.696L200.558 116.534C207.871 107.614 215.376 99.7857 216.619 99.7857C217.276 99.7857 217.789 114.967 217.756 133.522L217.697 167.259L208.769 157.815C200.555 149.126 196.266 143.165 181.786 120.318C174.709 109.153 148.941 81.5543 137.831 73.2408C132.848 69.5114 128.771 66.0668 128.771 65.5843C128.771 65.1018 131.146 63.143 134.051 61.2306C146.576 52.9838 168.498 29.341 168.498 24.0808C168.498 23.0925 167.53 21.3205 166.346 20.1414C164.469 18.274 157.912 18 115.187 18C67.5198 18 66.1102 18.0763 63.6389 20.7943ZM132.264 90.8861C143.776 96.4707 154.933 107.945 158.823 118.197C166.399 138.175 155.727 162.169 133.912 174.196C127.648 177.65 124.801 179.438 115.26 179.438C105.376 179.438 103.948 177.706 96.1316 173.488C80.4627 165.036 69.8637 148.545 69.8665 132.623C69.8678 115.61 80.6599 99.4 97.6508 90.8861C106.409 86.4983 108.484 85.9898 115.825 86.4315C121.387 86.7668 126.793 88.2308 132.264 90.8861Z"
            />
          </svg>
        </Link>
        <h1>Your Anthias Account</h1>
        <p>
          We are happy to have you here, <span>fisher</span>. If you need
          anything, feel free to{" "}
          <Link
            className={styles.link}
            href="mailto:team@anthias.xyz?subject = Feedback"
          >
            contact us
          </Link>
          .
        </p>
        {!loading ? (
          <Button onClick={handleLogOut}>Log Out</Button>
        ) : (
          <div className={styles.loading}>
            <Loader className={styles.loader} color="#1fcfcf" />
          </div>
        )}
      </div>
      <div className={`${styles.side} ${styles.right}`}>
        <span className={styles.top}>
          <h2>Account Info</h2>
        </span>
        <span className={styles.bottom}>
          <h2>
            Coming soon<span>...</span>
          </h2>
        </span>
      </div>
    </motion.div>
  );
}