sap.ui.define(function () { 'use strict';

  var spotSvg = `<svg width="128" height="128" viewBox="0 0 128 128" id="tnt-Spot-Secrets">
  <path fill="var(--sapIllus_ObjectFillColor)" d="M50.2525,50.5776 L50.2525,35.9126 L50.2405,35.9126 C50.2755,28.6236 56.2225,22.6886 63.5355,22.6886 C70.8365,22.6886 76.7825,28.6236 76.8185,35.9126 L76.8185,49.7676 C73.0015,48.2226 68.8325,47.3646 64.4615,47.3646 C59.3735,47.3646 54.5555,48.5186 50.2525,50.5776 M84.0235,53.7986 L84.0235,35.9126 L84.0115,35.9126 C83.9755,24.6556 74.8045,15.4956 63.5355,15.4956 C52.2665,15.4956 43.0825,24.6556 43.0475,35.9126 L43.0475,55.2776 C35.9805,61.3236 31.4955,70.3006 31.4955,80.3306 C31.4955,98.5366 46.2555,113.2956 64.4615,113.2956 C82.6675,113.2956 97.4275,98.5366 97.4275,80.3306 C97.4275,69.4486 92.1525,59.8026 84.0235,53.7986" class="sapIllus_ObjectFillColor"/>
  <path fill="var(--sapIllus_AccentColor)" d="M117.2233 25.1212C114.3303 23.9812 112.9273 21.2122 111.8413 18.3902 111.7763 18.2152 111.6103 18.0982 111.4233 18.0942L111.4183 18.0942C111.2333 18.0952 111.0673 18.2082 110.9983 18.3792 109.5503 21.8872 107.3983 23.6812 104.9053 25.7582L104.8473 25.8062C104.7113 25.9212 104.6513 26.1032 104.6923 26.2772 104.7323 26.4502 104.8673 26.5842 105.0413 26.6232 107.2393 27.1002 110.6423 31.3952 110.6423 33.6922 110.6403 33.9212 110.8063 34.1182 111.0333 34.1542 111.0543 34.1572 111.0763 34.1582 111.0983 34.1582 111.3023 34.1572 111.4803 34.0202 111.5353 33.8242 112.2643 31.2802 114.3813 27.0962 117.2223 25.9922 117.4633 25.8942 117.5793 25.6202 117.4813 25.3792 117.4343 25.2622 117.3413 25.1692 117.2243 25.1212L117.2233 25.1212zM99.0449 42.4951C97.5099 41.8681 96.7579 40.3221 96.1719 38.7451 96.1119 38.5731 95.9509 38.4551 95.7689 38.4501L95.7639 38.4501C95.5829 38.4531 95.4229 38.5661 95.3589 38.7351 94.6419 40.3911 93.4969 41.8251 92.0409 42.8911L92.0089 42.9191C91.8759 43.0371 91.8189 43.2181 91.8589 43.3901 91.8949 43.5601 92.0259 43.6951 92.1949 43.7361 93.3269 43.9901 95.1479 46.3731 95.1479 47.5981 95.1429 47.8241 95.3029 48.0191 95.5239 48.0591 95.5449 48.0621 95.5659 48.0641 95.5869 48.0641 95.7869 48.0601 95.9589 47.9231 96.0079 47.7301 96.4009 46.3081 97.5349 43.9731 99.0439 43.3651 99.2839 43.2581 99.3929 42.9771 99.2859 42.7361 99.2379 42.6291 99.1529 42.5431 99.0459 42.4951L99.0449 42.4951z" class="sapIllus_AccentColor"/>
  <path fill="var(--sapIllus_BrandColorSecondary)" d="M62.0067,54.7483 C76.1347,53.3923 88.6877,63.7473 90.0437,77.8753 C91.3987,92.0033 81.0447,104.5563 66.9167,105.9123 C52.7877,107.2673 40.2357,96.9133 38.8797,82.7853 C37.5237,68.6563 47.8777,56.1043 62.0067,54.7483 C62.0067,54.7483 62.0067,54.7483 62.0067,54.7483" class="sapIllus_BrandColorSecondary"/>
  <path fill="var(--sapIllus_PatternShadow)" d="M97.1953,78.0222 C96.9353,74.8042 96.1973,71.6422 95.0053,68.6412 C92.7043,63.0132 88.9203,58.1162 84.0553,54.4692 C84.7413,54.9832 85.2623,56.7902 85.6173,57.5702 C86.1533,58.7442 86.6373,59.9422 87.0683,61.1592 C87.8923,63.4852 88.5663,65.8972 88.9233,68.3382 C89.6963,73.6232 90.7173,78.5822 89.9093,83.9772 C89.1363,89.1402 86.8953,93.9072 83.3523,97.7422 C79.3453,102.0792 73.8103,104.9632 67.9833,105.9202 C62.8593,106.7622 57.6003,106.3732 52.5453,105.2812 C50.1603,104.7662 47.8153,103.9702 45.5263,103.1192 C44.3353,102.6762 43.1573,102.1992 41.9923,101.6902 C41.1953,101.3422 39.1683,100.8212 38.6523,100.1282 C41.9143,104.5092 46.2273,107.9982 51.1943,110.2732 C54.8443,111.9502 58.7743,112.9322 62.7843,113.1702 C64.2373,113.2492 65.6933,113.2412 67.1443,113.1472 C67.9753,113.0882 68.6893,112.9992 69.0023,112.9602 C69.4633,112.9122 69.9213,112.8402 70.3753,112.7432 C70.9043,112.6202 71.1113,112.5232 71.9613,112.2442 C72.6793,112.0102 73.0573,111.9062 73.4513,111.7862 C75.5233,111.1152 77.5563,110.3262 79.5383,109.4222 C80.6643,108.9572 81.7533,108.4062 82.7963,107.7762 C83.5473,107.2952 84.2683,106.7702 84.9563,106.2032 C86.3753,105.0492 87.7093,103.7962 88.9483,102.4502 C91.5923,99.3822 93.7133,95.8992 95.2253,92.1422 C96.9143,87.6382 97.5863,82.8162 97.1953,78.0222" class="sapIllus_PatternShadow"/>
  <path fill="var(--sapIllus_ObjectFillColor)" d="M100.7312,90.7478 L66.2422,90.7478 C60.4882,90.7478 55.8242,86.0838 55.8242,80.3298 L55.8242,80.3298 C55.8242,74.5768 60.4882,69.9128 66.2422,69.9128 L100.7312,69.9128 C106.4852,69.9128 111.1492,74.5768 111.1492,80.3298 L111.1492,80.3298 C111.1492,86.0838 106.4852,90.7478 100.7312,90.7478" class="sapIllus_ObjectFillColor"/>
  <path fill="var(--sapIllus_BrandColorPrimary)" d="M65.0449 82.333L63.3629 85.11C63.2619 85.278 63.0439 85.331 62.8759 85.23L61.8469 84.607C61.6669 84.498 61.6209 84.257 61.7479 84.089L63.8269 81.347C63.9789 81.145 63.8779 80.853 63.6339 80.79L60.5869 79.996C60.3889 79.944 60.2749 79.735 60.3409 79.54L60.7319 78.376C60.7959 78.183 61.0109 78.084 61.1999 78.16L64.0779 79.317C64.3159 79.413 64.5729 79.233 64.5639 78.977L64.4549 75.722C64.4479 75.521 64.6089 75.355 64.8089 75.355L65.9669 75.355C66.1679 75.355 66.3289 75.523 66.3209 75.724L66.1899 78.952C66.1789 79.207 66.4349 79.389 66.6729 79.296L69.5259 78.183C69.7139 78.109 69.9249 78.207 69.9909 78.398L70.3789 79.538C70.4459 79.734 70.3319 79.944 70.1319 79.996L67.0409 80.792C66.7979 80.855 66.6949 81.144 66.8449 81.346L68.8959 84.118C69.0199 84.286 68.9729 84.525 68.7949 84.633L67.7669 85.254C67.5969 85.356 67.3769 85.3 67.2769 85.129L65.6549 82.338C65.5189 82.106 65.1839 82.103 65.0449 82.333M77.1293 82.333L75.4473 85.11C75.3463 85.278 75.1283 85.331 74.9603 85.23L73.9313 84.607C73.7513 84.498 73.7053 84.257 73.8323 84.089L75.9113 81.347C76.0633 81.145 75.9623 80.853 75.7183 80.79L72.6713 79.996C72.4733 79.944 72.3593 79.735 72.4253 79.54L72.8163 78.376C72.8803 78.183 73.0953 78.084 73.2843 78.16L76.1623 79.317C76.4003 79.413 76.6573 79.233 76.6483 78.977L76.5393 75.722C76.5323 75.521 76.6933 75.355 76.8933 75.355L78.0513 75.355C78.2523 75.355 78.4133 75.523 78.4053 75.724L78.2743 78.952C78.2633 79.207 78.5193 79.389 78.7573 79.296L81.6103 78.183C81.7983 78.109 82.0093 78.207 82.0753 78.398L82.4633 79.538C82.5303 79.734 82.4163 79.944 82.2163 79.996L79.1253 80.792C78.8823 80.855 78.7793 81.144 78.9293 81.346L80.9803 84.118C81.1043 84.286 81.0573 84.525 80.8793 84.633L79.8513 85.254C79.6813 85.356 79.4613 85.3 79.3613 85.129L77.7393 82.338C77.6033 82.106 77.2683 82.103 77.1293 82.333M89.2137 82.333L87.5317 85.11C87.4307 85.278 87.2127 85.331 87.0447 85.23L86.0157 84.607C85.8357 84.498 85.7897 84.257 85.9167 84.089L87.9957 81.347C88.1477 81.145 88.0467 80.853 87.8027 80.79L84.7557 79.996C84.5577 79.944 84.4437 79.735 84.5097 79.54L84.9007 78.376C84.9647 78.183 85.1797 78.084 85.3687 78.16L88.2467 79.317C88.4847 79.413 88.7417 79.233 88.7327 78.977L88.6237 75.722C88.6167 75.521 88.7777 75.355 88.9777 75.355L90.1357 75.355C90.3367 75.355 90.4977 75.523 90.4897 75.724L90.3587 78.952C90.3487 79.207 90.6037 79.389 90.8417 79.296L93.6947 78.183C93.8827 78.109 94.0937 78.207 94.1597 78.398L94.5477 79.538C94.6147 79.734 94.5007 79.944 94.3007 79.996L91.2097 80.792C90.9667 80.855 90.8637 81.144 91.0137 81.346L93.0647 84.118C93.1887 84.286 93.1417 84.525 92.9637 84.633L91.9357 85.254C91.7657 85.356 91.5457 85.3 91.4457 85.129L89.8237 82.338C89.6877 82.106 89.3527 82.103 89.2137 82.333M101.2981 82.333L99.6161 85.11C99.5151 85.278 99.2971 85.331 99.1291 85.23L98.1001 84.607C97.9201 84.498 97.8741 84.257 98.0011 84.089L100.0801 81.347C100.2321 81.145 100.1311 80.853 99.8871 80.79L96.8401 79.996C96.6421 79.944 96.5281 79.735 96.5941 79.54L96.9851 78.376C97.0491 78.183 97.2641 78.084 97.4531 78.16L100.3311 79.317C100.5691 79.413 100.8261 79.233 100.8171 78.977L100.7081 75.722C100.7011 75.521 100.8621 75.355 101.0621 75.355L102.2201 75.355C102.4211 75.355 102.5821 75.523 102.5741 75.724L102.4431 78.952C102.4331 79.207 102.6881 79.389 102.9261 79.296L105.7791 78.183C105.9671 78.109 106.1781 78.207 106.2441 78.398L106.6321 79.538C106.6991 79.734 106.5851 79.944 106.3851 79.996L103.2941 80.792C103.0511 80.855 102.9481 81.144 103.0981 81.346L105.1491 84.118C105.2731 84.286 105.2261 84.525 105.0481 84.633L104.0201 85.254C103.8501 85.356 103.6301 85.3 103.5301 85.129L101.9081 82.338C101.7721 82.106 101.4371 82.103 101.2981 82.333" class="sapIllus_BrandColorPrimary"/>
  <path fill="var(--sapIllus_StrokeDetailColor)" d="M100.73,90.25 L66.24,90.25 C60.77,90.25 56.32,85.8 56.32,80.33 C56.32,74.86 60.77,70.41 66.24,70.41 L100.73,70.41 C106.2,70.41 110.65,74.86 110.65,80.33 C110.65,85.8 106.2,90.25 100.73,90.25 L100.73,90.25 Z M64.46,112.8 C46.56,112.8 32,98.23 32,80.33 C32,70.87 36.07,62.34 42.55,56.39 C42.87,56.09 43.21,55.8 43.55,55.51 C45.44,53.91 47.52,52.52 49.75,51.39 C50.08,51.22 50.41,51.06 50.75,50.9 C54.92,48.95 59.56,47.86 64.46,47.86 C68.64,47.86 72.65,48.66 76.32,50.11 C76.66,50.24 76.99,50.37 77.32,50.51 C79.52,51.47 81.6,52.66 83.52,54.06 C83.86,54.3 84.19,54.55 84.52,54.81 C89.27,58.56 92.96,63.6 95.04,69.41 L66.24,69.41 C60.22,69.41 55.32,74.31 55.32,80.33 C55.32,86.35 60.22,91.25 66.24,91.25 L95.04,91.25 C90.54,103.8 78.53,112.8 64.46,112.8 L64.46,112.8 Z M76.32,35.91 L76.32,49.03 C72.63,47.63 68.63,46.86 64.46,46.86 C59.58,46.86 54.94,47.91 50.75,49.8 L50.75,35.62 C50.94,28.74 56.61,23.19 63.54,23.19 C70.55,23.19 76.28,28.9 76.32,35.91 L76.32,35.91 Z M43.55,35.91 C43.58,24.93 52.55,16 63.54,16 C74.52,16 83.48,24.93 83.51,35.91 L83.52,52.83 C81.59,51.49 79.52,50.35 77.32,49.43 L77.32,35.91 C77.28,28.34 71.1,22.19 63.54,22.19 C55.97,22.19 49.78,28.34 49.74,35.91 L49.75,50.28 C47.54,51.36 45.46,52.69 43.55,54.22 L43.55,35.91 Z M100.73,69.41 L96.1,69.41 C93.89,63.04 89.81,57.53 84.52,53.56 L84.52,35.91 L84.51,35.41 L84.5,35.41 C84.2,24.11 74.9,15 63.54,15 C52,15 42.58,24.38 42.55,35.91 L42.55,55.06 C35.48,61.19 31,70.25 31,80.33 C31,98.78 46.01,113.8 64.46,113.8 C79.09,113.8 91.56,104.36 96.1,91.25 L100.73,91.25 C106.75,91.25 111.65,86.35 111.65,80.33 C111.65,74.31 106.75,69.41 100.73,69.41 L100.73,69.41 Z" class="sapIllus_StrokeDetailColor"/>
</svg>`;

  return spotSvg;

});
