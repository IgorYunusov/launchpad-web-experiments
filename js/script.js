'use strict';

(function ($) {
  angular.module('MB', ['ui.router', 'ngAnimate']);
})(jQuery);

(function () {
  angular.module('MB').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider.state('about', {
      url: '/',
      templateUrl: 'templates/pages/home/index.html',
      controller: 'HomeCtrl',
      controllerAs: 'vm'
    }).state('projects', {
      url: '/projects',
      templateUrl: 'templates/pages/projects/index.html'
    }).state('companies', {
      url: '/companies',
      templateUrl: 'templates/pages/companies/index.html',
      controller: 'CompaniesCtrl',
      controllerAs: 'vm'
    }).state('contact', {
      url: '/contact',
      templateUrl: 'templates/pages/contact/index.html',
      controller: 'ContactCtrl',
      controllerAs: 'vm'
    }).state('apply', {
      url: '/apply',
      templateUrl: 'templates/pages/apply/index.html',
      controller: 'ApplyCtrl',
      controllerAs: 'vm'
    }).state('lab', {
      url: '/lab',
      templateUrl: 'templates/pages/lab/index.html',
      controller: 'LabCtrl',
      controllerAs: 'vm'
    }).state('experiment', {
      url: '/experiment/{titlePath}',
      controller: 'LabCtrl',
      controllerAs: 'vm',
      templateUrl: function templateUrl(params) {
        return 'templates/pages/lab/experiments/' + params.titlePath + '/index.html';
      }
    }).state('blog', {
      url: '/blog',
      templateUrl: 'templates/pages/blog/index.html',
      controller: 'BlogCtrl',
      controllerAs: 'vm'
    }).state('post', {
      url: '/{datePath}/{titlePath}',
      controller: 'BlogCtrl',
      controllerAs: 'vm',
      templateUrl: function templateUrl(params) {
        return 'templates/pages/blog/posts/' + params.datePath + "/" + params.titlePath + '.html';
      }
    });

    // $locationProvider.html5Mode({enabled: true, requireBase: false, rewriteLinks: false});
  });
})();
'use strict';

(function () {
  angular.module('MB').factory('BlogService', BlogService);

  BlogService.$inject = ['DateService'];

  function BlogService(DateService) {
    var factory = {
      getPostMetaData: getPostMetaData,
      getPostData: getPostData
    };

    var postMetaData = [{
      datePath: "2-22-2017",
      titlePath: "nlp-with-stella",
      title: "Natural Language Processing with Stella",
      author: "Felix Su",
      date: DateService.blogDate(2, 22, 2017),
      tags: ["Project Luna", "NLP", "Speech Recognition", "Hack Night"],
      category: "Hack Night 2",
      preview: "Last Saturday, our Luna developers dove into the Stella Demo to implement Natural Language Processing. If you checked our original source code, you would have seen an ugly jumble of if statements that hard coded mappings between commands and our API functions. To tackle this problem, we split into 2 teams to test which combinations of the NLP techniques we learned at Wednesday's Tech Tutorial could best allow Stella to understand and support commands that our engineers might not anticipate."
    }, {
      datePath: "2-26-2017",
      titlePath: "sherlock-facial-recognition",
      title: "Launchpad + Computer Vision: Face Detection in 20 Lines of Code",
      author: "Peter Lee",
      date: DateService.blogDate(2, 26, 2017),
      tags: ["Project Sherlock", "Face Detection"],
      category: "Computer Vision Tutorial",
      preview: "In this tutorial, we'll showcase the power of OpenCV by writing a short python script that recognizes your face through a live webcam in real-time. This was a warmup exercise for our newest members of the Launchpad Team for Project Sherlock, a cloud API that provides optimized algorithms for human-centric computer vision."
    }];

    function parseText(text) {
      return text.replace(/^ +| +$/gm, "");
    }

    function cleanPostData(post) {
      post.preview = parseText(post.preview);
      return post;
    }

    function getPostMetaData() {
      var cleanData = postMetaData;
      for (var i = 0; i < cleanData.length; i++) {
        cleanData[i].preview = parseText(cleanData[i].preview);
      }
      return cleanData;
    }

    function getPostData(titlePath) {
      for (var i = 0; i < postMetaData.length; i++) {
        if (titlePath == postMetaData[i].titlePath) return cleanPostData(postMetaData[i]);
      }
      return null;
    }

    return factory;
  }
})();
'use strict';

(function () {
    angular.module('MB').factory('DateService', DateService);

    DateService.$inject = ['moment'];

    function DateService(moment) {
        var factory = {
            blogDate: blogDate
        };

        function blogDate(month, day, year) {
            return moment(new Date(year, month - 1, day)).format("MMM D, YYYY");
        }

        return factory;
    }
})();
'use strict';

(function () {
  angular.module('MB').factory('DropboxService', DropboxService);

  DropboxService.$inject = ['Dropbox', '$http', '$log'];

  function DropboxService(Dropbox, $http, $log) {
    var factory = {
      uploadFile: uploadFile
    };

    function uploadFile(filePath, fileContents) {
      Dropbox.filesUpload({ path: filePath, contents: fileContents, mode: { ".tag": "add" }, autorename: true }).then(function (response) {
        $log.debug('File Uploaded to Dropbox: ' + JSON.stringify(response));
        return true;
      }).catch(function (error) {
        $log.error(error);
        return false;
      });
      return true;
    }

    return factory;
  }
})();
'use strict';

(function () {
  angular.module('MB').factory('FormService', FormService);

  FormService.$inject = ['$http', '$log', 'Dropbox'];

  function FormService($http, $log, Dropbox) {
    var factory = {
      checkFullSubmit: checkFullSubmit,
      sendMessage: sendMessage,
      sendToSheet: sendToSheet,
      submitApplication: submitApplication,
      updateTextArea: updateTextArea
    };

    function checkFullSubmit(object) {
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          if (!object[key] && key != 'optional' && key != 'github') {
            console.log("Invalid key: " + key);
            return false;
          }
        }
      }
      return true;
    }

    function camelCaseToPretty(text) {
      var spaces = text.replace(/([A-Z0-9])/g, " $1");
      var pretty = spaces.charAt(0).toUpperCase() + spaces.slice(1);
      return pretty;
    }

    function renameProperty(object, oldName, newName) {
      if (oldName == newName) {
        return object;
      }
      if (object.hasOwnProperty(oldName)) {
        object[newName] = object[oldName];
        delete object[oldName];
      }
      return object;
    };

    function prettyObjectKeys(object) {
      for (var key in object) {
        if (object.hasOwnProperty(key)) object = renameProperty(object, key, camelCaseToPretty(key));
      }
      return object;
    }

    function sendMessage(messageObject, errorMessage, gFormURL) {
      var okay = checkFullSubmit(messageObject);
      var postData = $.param(messageObject);
      console.log(postData);

      if (okay) {
        $http({
          url: gFormURL,
          method: "POST",
          data: postData,
          dataType: "json"
        }).then(function successCallback(response) {
          $log.debug(response);
        }, function errorCallback(response) {
          $log.error(response);
        });
        return true;
      }
      if (!errorMessage) {
        Materialize.toast("Please complete all fields.", 2000);
      } else {
        Materialize.toast(errorMessage, 2000);
      }
      return false;
    }

    function submitApplication(messageObject, sheetURL, errorMessage, resume) {
      var okay = checkFullSubmit(messageObject);
      if (okay) {
        Dropbox.filesUpload({ path: '/resumes/' + resume.name, contents: resume, mode: { ".tag": "add" }, autorename: true }).then(function (response) {
          $log.debug('File Uploaded to Dropbox: ' + JSON.stringify(response));
          messageObject.resume = response.name;
          sendToSheet(messageObject, sheetURL, errorMessage);
          return true;
        }).catch(function (error) {
          $log.error(error);
          return false;
        });
        return true;
      }
      if (!errorMessage) {
        Materialize.toast("Please complete all fields.", 2000);
      } else {
        Materialize.toast(errorMessage, 2000);
      }
      return false;
    }

    function sendToSheet(messageObject, sheetURL, errorMessage) {
      var okay = checkFullSubmit(messageObject);
      var message = prettyObjectKeys(messageObject);
      var postData = $.param(messageObject);
      if (okay) {
        $.ajax({
          url: sheetURL,
          type: "post",
          data: postData,
          success: function success(response) {
            $log.debug('Message Sent: ' + JSON.stringify(response));
          },
          error: function error(request, textStatus, errorThrown) {
            $log.error("Status: " + textStatus);
            $log.error("Error: " + errorThrown);
          }
        });
        return true;
      }
      if (!errorMessage) {
        Materialize.toast("Please complete all fields.", 2000);
      } else {
        Materialize.toast(errorMessage, 2000);
      }
      return false;
    }

    var isWhitespace = function isWhitespace(char) {
      return char == ' ' || char == '\n';
    };

    function updateTextArea($event, vmObject, textObject, textKey, wordCountVar, wordLimit) {
      if (!isWhitespace(vmObject[textObject][textKey][0])) vmObject[wordCountVar] = 1;

      for (var i = 1; i < vmObject[textObject][textKey].length; i++) {
        if (!isWhitespace(vmObject[textObject][textKey][i]) && isWhitespace(vmObject[textObject][textKey][i - 1])) {
          vmObject[wordCountVar]++;
          if (vmObject[wordCountVar] == wordLimit + 1) {
            vmObject[wordCountVar]--;
            vmObject[textObject][textKey] = vmObject[textObject][textKey].substring(0, i);
            return;
          } else if (!isWhitespace(vmObject[textObject][textKey][i]) && !isWhitespace(vmObject[textObject][textKey][i - 1]) && vmObject[wordCountVar] == 0) {
            vmObject[wordCountVar] = 1;
          }
        }
      }

      if (vmObject[textObject][textKey].length == 0) vmObject[wordCountVar] = 0;
    }

    return factory;
  }
})();
'use strict';

(function () {
  angular.module('MB').factory('LabService', LabService);

  function LabService() {
    var factory = {
      getExperimentMetaData: getExperimentMetaData,
      getExperimentData: getExperimentData
    };

    var experimentMetaData = [{
      titlePath: "glasses",
      title: "Glasses with Face Recognition",
      tags: ["Project Sherlock", "Computer Vision"],
      category: "Computer Vision",
      preview: "Experimenting with Haar Cascades for real-time face detection."
    }];

    function parseText(text) {
      // Trim whitespace
      return text.replace(/^ +| +$/gm, "");
    }

    function cleanExperimentData(experiment) {
      experiment.preview = parseText(experiment.preview);
      return experiment;
    }

    function getExperimentMetaData() {
      var cleanData = experimentMetaData;
      for (var i = 0; i < cleanData.length; i++) {
        cleanData[i].preview = parseText(cleanData[i].preview);
      }
      return cleanData;
    }

    function getExperimentData(titlePath) {
      for (var i = 0; i < experimentMetaData.length; i++) {
        if (titlePath == experimentMetaData[i].titlePath) return cleanExperimentData(experimentMetaData[i]);
      }
      return null;
    }

    return factory;
  }
})();
'use strict';

(function () {
  angular.module('MB').factory('TeamService', TeamService);

  TeamService.$inject = ['$http', '$log'];

  function TeamService(Dropbox, $http, $log) {
    var factory = {
      getAll: getAll,
      getExecutives: getExecutives,
      getBusiness: getBusiness,
      getDevelopers: getDevelopers,
      getMembers: getMembers
    };

    var team = {
      executives: [{
        "name": "Felix Su",
        "position": "President / Project Leader",
        "website": "http://felixsu.com",
        "header": "Amazon SDE Intern",
        "subheader": "",
        "image": "/img/team/executives/felix_su.png",
        "semester": "Spring 2017"
      }, {
        "name": "Peter Lee",
        "position": "President / Project Leader",
        "website": "http://peterlee.tech",
        "header": "Microsoft SDE Intern",
        "subheader": "",
        "image": "/img/team/executives/peter_lee.png",
        "semester": "Spring 2017"
      }, {
        "name": "Katie Li",
        "position": "External Vice President",
        "website": "http://linkedin.com/in/katienli",
        "header": "Project Manager at",
        "subheader": "",
        "image": "/img/team/executives/katie_li.jpg",
        "semester": "Spring 2017"
      }, {
        "name": "Michelle Huang",
        "position": "Internal Vice President",
        "website": "http://linkedin.com/in/michellerhuang",
        "header": "Business Analyst at",
        "subheader": "",
        "image": "/img/team/executives/michelle_huang.jpg",
        "semester": "Spring 2017"
      }],
      business: [{
        "name": "Aditya Gandhi",
        "position": "Business Developer",
        "website": "https://www.linkedin.com/in/adigandhi1",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/business/aditya_gandhi.jpg",
        "semester": "Spring 2017"
      }, {
        "name": "Jim Xu",
        "position": "Business Developer",
        "website": "https://www.linkedin.com/in/zijingxu",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/business/jim_xu.jpg",
        "semester": "Spring 2017"
      }],
      designers: [],
      developers: [{
        "name": "Annie Wang",
        "position": "Project Developer",
        "website": "https://www.linkedin.com/in/annieyueyiwang",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/developers/annie_wang.jpg",
        "semester": "Spring 2017"
      }, {
        "name": "Arsh Zahed",
        "position": "Project Developer",
        "website": "https://github.com/azahed98",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/developers/arsh_zahed.jpg",
        "semester": "Spring 2017"
      }, {
        "name": "Caleb Siu",
        "position": "Project Developer",
        "website": "https://www.linkedin.com/in/calebsiu",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/developers/caleb_siu.jpg",
        "semester": "Spring 2017"
      }, {
        "name": "Darren Lee",
        "position": "Project Developer",
        "website": "http://darrenklee.me/",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/developers/darren_lee.png",
        "semester": "Spring 2017"
      }, {
        "name": "Evan Limanto",
        "position": "Project Developer",
        "website": "http://evanlimanto.github.io/",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/developers/evan_limanto.jpg",
        "semester": "Spring 2017"
      }, {
        "name": "George Zhang",
        "position": "Project Developer",
        "website": "",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/developers/george_zhang.jpg",
        "semester": "Spring 2017"
      }, {
        "name": "Hank O'Brien",
        "position": "Project Developer",
        "website": "https://github.com/hjobrien",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/developers/hank_obrien.jpg",
        "semester": "Spring 2017"
      }, {
        "name": "Harika Kalidhindi",
        "position": "Project Developer",
        "website": "https://github.com/jrharika",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/developers/harika_kalidhindi.jpg",
        "semester": "Spring 2017"
      }, {
        "name": "Lenny Dong",
        "position": "Project Developer",
        "website": "http://lennyd.me/",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/developers/lenny_dong.jpg",
        "semester": "Spring 2017"
      }, {
        "name": "Michael Fan",
        "position": "Project Developer",
        "website": "https://github.com/RI5E",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/developers/michael_fan.jpg",
        "semester": "Spring 2017"
      }, {
        "name": "Nate Young",
        "position": "Project Developer",
        "website": "https://github.com/natetyoung",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/developers/nate_young.jpg",
        "semester": "Spring 2017"
      }, {
        "name": "Nick Zoghb",
        "position": "Project Developer",
        "website": "https://github.com/nzoghb",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/developers/nick_zoghb.jpg",
        "semester": "Spring 2017"
      }, {
        "name": "Nina Chang",
        "position": "Project Developer",
        "website": "https://www.linkedin.com/in/nina-chang-100133118",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/developers/nina_chang.jpg",
        "semester": "Spring 2017"
      }, {
        "name": "Nipun Ramakrishnan",
        "position": "Project Developer",
        "website": "https://www.linkedin.com/in/nipun-ramakrishnan-001a40116",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/developers/nipun_ramakrishnan.jpg",
        "semester": "Spring 2017"
      }, {
        "name": "Vishal Satish",
        "position": "Project Developer",
        "website": "https://github.com/visatish",
        "header": "",
        "subheader": "",
        "image": "/img/team/members/developers/vishal_satish.jpg",
        "semester": "Spring 2017"
      }]
    };

    function getAll() {
      var result = [];
      for (var key in team) {
        if (team.hasOwnProperty(key)) {
          result = result.concat(team[key]);
        }
      }
      return result;
    }

    function getExecutives() {
      return team.executives;
    }

    function getBusiness() {
      return team.business;
    }

    function getDevelopers() {
      return team.developers;
    }

    function getMembers() {
      var result = [];
      for (var key in team) {
        if (team.hasOwnProperty(key)) {
          if (key != "executives") result = result.concat(team[key]);
        }
      }
      return result;
    }

    return factory;
  }
})();
'use strict';

(function () {
  angular.module('MB').controller('ApplyCtrl', ApplyCtrl);

  ApplyCtrl.$inject = ['FormService', '$http', '$log', 'Dropbox', 'DropboxService', 'ApplicationSheetURL'];

  function ApplyCtrl(FormService, $http, $log, Dropbox, DropboxService, ApplicationSheetURL) {
    var vm = this;
    var temp_deadline = new Date(Date.UTC(2017, 0, 28, 23, 59, 0));
    temp_deadline.setTime(temp_deadline.getTime() + temp_deadline.getTimezoneOffset() * 60 * 1000);
    var APP_DEADLINE = temp_deadline;
    var WORD_LIMIT = 200;
    vm.years = ["Freshman", "Sophomore", "Junior", "Senior"];
    vm.positions = ["Project Developer", "Project Leader", "Designer", "Business Developer"];

    vm.submitted = false;
    vm.page = 1;
    vm.wordCount1 = 0;
    vm.wordCount2 = 0;
    vm.wordCount3 = 0;

    vm.basic = { firstName: null, lastName: null, year: null, major: null, email: null, phone: null, position: null, resume: null };
    vm.responses = { interestingProject: null, teamExperience: null };
    vm.additional = { optional: null, github: null };

    vm.submitForm = function () {
      var fullForm = $.extend({}, Object.assign(vm.basic, vm.responses, vm.additional));
      var resume = document.getElementById('resume').files[0];
      $log.debug(fullForm);
      var errMsg = "Error: You must complete all previous fields to continue.";
      var sent = FormService.submitApplication(fullForm, ApplicationSheetURL, errMsg, resume);
      if (sent) {
        vm.submitted = true;
        return true;
      }
      $log.warn('Application not sent!');
      return false;
    };

    vm.changePage = function (page) {
      if (page <= 3 && page >= 0) {
        vm.page = page;
        return true;
      }
      return false;
    };

    vm.next = function (object) {
      vm.changePage(vm.page + 1, object);
    };
    vm.prev = function () {
      if (vm.page >= 0) vm.page -= 1;
    };

    vm.updateTextArea1 = function ($event) {
      FormService.updateTextArea($event, vm, 'responses', 'interestingProject', 'wordCount1', WORD_LIMIT);
    };
    vm.updateTextArea2 = function ($event) {
      FormService.updateTextArea($event, vm, 'responses', 'teamExperience', 'wordCount2', WORD_LIMIT);
    };
    vm.updateTextArea3 = function ($event) {
      FormService.updateTextArea($event, vm, 'additional', 'optional', 'wordCount3', WORD_LIMIT);
    };

    vm.pastDeadline = function () {
      console.log(APP_DEADLINE);console.log(Date.now() > APP_DEADLINE);return Date.now() > APP_DEADLINE;
    };
  }
})();
'use strict';

(function () {
  angular.module('MB').controller('BlogCtrl', BlogCtrl).directive('blogPost', PostDir).directive('fbComments', FBComments);

  BlogCtrl.$inject = ['BlogService', '$stateParams'];

  function BlogCtrl(BlogService, $stateParams) {
    var vm = this;
    vm.currentPost = BlogService.getPostData($stateParams.titlePath);
    vm.posts = BlogService.getPostMetaData();
  }

  function PostDir() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        name: "=",
        author: "=",
        date: "=",
        tags: '=',
        category: '=',
        datePath: '=',
        titlePath: '='
      },
      templateUrl: 'templates/pages/blog/post.html'
    };
  }

  function FBComments() {
    function createHTML(href) {
      return '<div class="fb-comments" ' + 'data-href="' + href + '" ' + 'data-width="100%" data-numposts="5">' + '</div>';
    }
    return {
      restrict: 'E',
      scope: {},
      link: function link(scope, elem, attrs) {
        attrs.$observe('pageHref', function (newValue) {
          if (newValue) {
            var href = newValue;
            elem.html(createHTML(href));
            FB.XFBML.parse(elem[0]);
          } else {
            element.html("<div></div>");
          }
        });
      }
    };
  }
})();
'use strict';

(function () {
  angular.module('MB').controller('CompaniesCtrl', CompaniesCtrl);

  CompaniesCtrl.$inject = ['FormService', 'CompanySheetURL'];

  function CompaniesCtrl(FormService, CompanySheetURL) {
    var vm = this;
    vm.submitted = false;

    vm.company = { organization: null, email: null, firstName: null, lastName: null, subject: null, message: null };

    vm.sendRequest = function () {
      var errMsg = "Error: Please complete all fields so we have enough information to proceed.";
      var sent = FormService.sendToSheet(vm.company, CompanySheetURL, errMsg);
      if (sent) {
        vm.submitted = true;
        return true;
      }
      return false;
    };
  }
})();
'use strict';

(function () {
  angular.module('MB').controller('ContactCtrl', ContactCtrl);
  ContactCtrl.$inject = ['FormService', '$http', '$log', 'ContactSheetURL'];

  function ContactCtrl(FormService, $http, $log, ContactSheetURL) {
    var vm = this;

    vm.submitted = false;
    vm.contact = { firstName: null, lastName: null, email: null, subject: null, message: null };

    vm.sendMessage = function () {
      var sent = FormService.sendToSheet(vm.contact, ContactSheetURL);
      if (sent) {
        vm.submitted = true;
        return true;
      }
      return false;
    };
  }
})();
'use strict';

(function () {
  angular.module('MB').controller('HomeCtrl', HomeCtrl);
  HomeCtrl.$inject = ['FormService', 'NotificationSheetURL', 'TeamService'];

  function HomeCtrl(FormService, NotificationSheetURL, TeamService) {
    var vm = this;

    vm.submitted = false;
    vm.notification = { firstName: null, lastName: null, email: null };

    vm.sendMessage = function () {
      var sent = FormService.sendToSheet(vm.notification, NotificationSheetURL);
      if (sent) {
        vm.submitted = true;
        return true;
      }
      return false;
    };

    vm.team = TeamService.getAll();
    vm.executives = TeamService.getExecutives();
    vm.business = TeamService.getBusiness();
    vm.developers = TeamService.getDevelopers();
  }
})();
'use strict';

(function () {
  angular.module('MB').controller('LabCtrl', LabCtrl).directive('labExperiment', ExperimentDir);

  LabCtrl.$inject = ['LabService', '$stateParams', '$scope', '$window', '$rootScope'];

  function LabCtrl(LabService, $stateParams, $scope, $window, $rootScope) {
    var vm = this;
    vm.currentExperiment = LabService.getExperimentData($stateParams.titlePath);
    vm.experiments = LabService.getExperimentMetaData();

    function getLastWord(str) {
      var extracted = str.split("/");
      if (extracted[extracted.length - 1].length > 0) return extracted[extracted.length - 1];else return extracted[extracted.length - 2];
    }

    $rootScope.$on('$locationChangeStart', function (event, next, current) {
      var currentPage = getLastWord(current);
      if (currentPage == 'glasses') {
        $window.location.reload();
      }
      var nextPage = getLastWord(next);
      if (nextPage == 'glasses') {
        $window.location.reload();
      }
    });
  }

  function ExperimentDir() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        name: "=",
        titlePath: "=",
        tags: '=',
        category: '='
      },
      templateUrl: 'templates/pages/lab/experiment.html'
    };
  }
})();