import Cookie from 'js-cookie';
import cookieparser from 'cookieparser';

export default function(axios) {
  let host = window.location.host;
  let target = host.slice(0, host.indexOf("."));
  let { access, refresh } = cookieparser.parse(document.cookie || '');

  if(target === 'test1' || target === '192') {
    target = 'univer';

    access = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNTY1OTU0NzUxLCJqdGkiOiJiOWRiNWQ1ZGMyZDA0OGFiYjcwOGFmOTRjNGI4MGUzMCIsInVzZXJfaWQiOjMzfQ.NEni3IYoqQSfF5ltGuI8cjhQzdRU1HZPB4Od3fupH59OaU1B2vSY6fCT2Xqojh6CTLIJFSJzm3EACG9s4nPuanKIPjcB9i88Z18f7-9s9ExHSUNMvbVW8qbl8jXAqkwdE29agk18ObslNiN5e0oQeNrtt-rMbmGSxMXd16_CUifEE7nozMOrA6vmHg-mRn7LtGBzC-2UKx_oTYr2-BXR2hDDtugKccOKz5kRZUI4QebRv32xjwfSqNt4d99RcN4o0nOgnwtHOJt33hJ22nqcZHn1eXCtzqWQeM0IjmmzGyENjFtmLVi123wQXBxK46DIhwTVmKgC4mctfH20bcNsZB8qYSOlKvatSlU3zdwxASF-C1pALrvSMypZDqx6zeHTLvIJO-OVVcGNJX-2-5OfFzeXw9hWB5771gCnRumSPMqWxyqz7cYEoyss6Mcu6OYgDO5kESEfP0F5PvdYTuNVOz7Q4bhpBYQ77M4WQjJkCumQvkLfZaFJ-4NxSNjJGPRt4AHSlS-8hRv9DrDCUmBs3DP5OdHuIV3I-vdspChQA2Ri_2ws9wJHFm8k8QgodeQrx7lJDXQwghVM8nx9BMytN7F4ZO4NS_rm4D1H4_nlpcebqR3D1hX_-NUGskIm2PWMB0ae55i55zM_jIv08GMFH6N8hYQ7ceWElX1yuSCAl6w";
    refresh = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTU2NTE1MzY3NSwianRpIjoiM2I5MGFlYzY3ZTNkNDU4MWE4NGZjNDAyMzEwM2Y1MTQiLCJ1c2VyX2lkIjo1OX0.kmBirtivBMRGqOWstWg95qjz63Tr8ufNzaIbOInRMRvRQjbW7fl0LlTwr32TVUE6lsq03L1fzdOQdi8V7locaTMBnDaui1iv-YegNL4P2-ioh9mfdnOxKFQ02t5CcUmm7Pd-dw1LeuFSZrTQwIYzstWLGbw4xGAFk9HWoVnFRPoV8lS51PiLr95rEf7mZemOqs3AFIylapCWC158SexyvXq-PKOQ6sMypt5lFDgebJJyhJfcC1OS-BGvZeXWGN4lWs4JekUq7fs71v6adstwGPfQ5W_-6rdoZwxVGRMuQkifMGl4jrFYCe9orM8aDnHUnan2Md1MQLwLC9TEPeSTKO7Zk2bH2spksvtWYTk8xKGMdwFGKE3YFeA6ev6jho-NovWm6drhFCpucIhmr3ceh_ZIOJtEveW7Gq9zzQjxwXXBSBwl2tRyEUJkGrLGi5Tq6OlMlflogsXn2tBX1EnEA3_medbdcPcXJRB1q1BwcPZS_JYgCaNHHr9CctrbZDe3WAdMkHgTTfQerrML9ott0lyRYH1ZIXFZEW5CXdnuQpw91WKXlFcol4IY6IPv_xiQCegUhe_0ITyxhbZv6nc_GxQYBmBR3_U7uT1R-SAM1z6zXUR7wQ9w4T728ESQUDwIAY8nTck07wMHSDsyR2He4h3ZXH7V5itlGgMtew2yXbE";
  }

  if(!access) {
    window.location.href = 'https://' + target + '.isirius.kz/auth/';
  }

  axios.defaults.baseURL = 'https://' + target + '.isirius.kz/v1/';
  axios.defaults.headers.common['Accept-Language'] = 'ru';

  axios.defaults.headers.common['Authorization'] = `JWT ${access}`;

  axios.interceptors.response.use((response) => {
    return response;
  }, function (error) {
      const code = parseInt(error.response && error.response.status);

      if (code === 401 && error.response.data.detail === "Given token not valid for any token type") {
        if (!error.config._retry) {
          error.config._retry = true;

          return axios.post('auth/refresh/', {refresh})
            .then(response => {
              const access = response.data.access;

              Cookie.set('access', access);

              axios.defaults.headers.common['Authorization'] = `JWT ${access}`;

              error.config.headers.Authorization = 'JWT ' + access;

              return axios.request(error.config);
            })
            .catch(error => {
              const code = parseInt(error.response && error.response.status);

              if(code === 401 && error.response.data.detail === "Token is invalid or expired") {
                Cookie.remove('access');
                Cookie.remove('refresh');

                window.location.href = 'https://' + target + '.isirius.kz/auth/';
              }
            });
        }
      }

      return Promise.reject(error);
  });
}