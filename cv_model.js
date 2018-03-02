
// MODULE

var cv_app = angular.module('myCV', ['ngResource','ui.router']);

//STATES

cv_app.config(function ($stateProvider, $urlRouterProvider){

    $urlRouterProvider.otherwise('/about-me');

    $stateProvider
        .state('about-me',{
            url: '/about-me',
            templateUrl: 'templates/about-me.html',
            controller: 'abtMeCtrl',
            controllerAs: 'abtMe'
        })

        .state('projects',{
            url: '/projects',
            templateUrl: 'templates/projects.html',
            // controller: 'projCtrl',
            // controllerAs:'proj'

        })

        .state('resume',{
            url: '/resume',

            views: {
                '':{ templateUrl: 'templates/resume.html',
                    controller: 'resumeCtrl',
                    controllerAs: 'resume'
                },

                'colExperienceAndEducation@resume':{
                    templateUrl : 'templates/education-experience.html',
                    controller: 'resumeCtrl',
                    controllerAs: 'resume'
                },

                'colSkillSet@resume':{
                    templateUrl: 'templates/skill-set.html',
                    controller: 'resumeCtrl',
                    controllerAs: 'resume'
                }

            }
        })

        .state('contact-me',{
            url: '/contact-me',
            templateUrl: 'templates/contact-me.html',
            replace: true,
            controller: 'contactMeCtrl',
            controllerAs: 'contactMe'
        })


});

//CONTROLLERS

cv_app.controller('abtMeCtrl',['cvDataService', '$scope',function(cvDataService, $scope){

    var abtMe = this;

    cvDataService.getData(function(data){
        console.log("cv datea in abt ctrl -- "+data);
        abtMe.description = data.cv_data.AboutMe.AboutMeDesc;
        abtMe.objective = data.cv_data.AboutMe.AboutMeObjective;
        abtMe.likes = data.cv_data.AboutMe.Likes ;
        abtMe.details = data.cv_data.AboutMe.PersonalDetails;
        wordsArray = abtMe.description;

    }, function(error){
        console.log('fetch error--',error);
    });


}]);


$(function(){
    $("button").click(function(){
        $("#personal-details-block").slideToggle();
    });
});

$(function () {
    count = 0;
    setInterval(function () {
        count++;
        $("#word").fadeOut(400, function () {
            $(this).text(wordsArray[count % wordsArray.length]).fadeIn(400);
        });
    }, 2000);
});



cv_app.controller('contactMeCtrl',['cvDataService', 'EmailService',function(cvDataService, EmailService){

    var contactMe = this;

    cvDataService.getData(function(data){
        contactMe.emailid = data.cv_data.ContactMe.email_id;
        contactMe.mobile = data.cv_data.ContactMe.mobileno;
        contactMe.homeaddress = data.cv_data.ContactMe.home_address;
    }, function(error){
        console.log('fetch error--',error);
    });

    function sendEmail (email_form) {
    console.log("infor sent to controller from form is -- "+email_form);

        var data={};
        data.key = '3d3a005f4412373bf162aab927709c9e-us16';
        data.message ={from_email: email_form.from_emailid}  ;
        data.message.to = [{email: contactMe.emailid ,
                            name: 'subashini sekhar',
                            }];
        data.message.subject = email_form.subject;
        data.message.html = email_form.message;

        EmailService.sendEmail({data: data});

    }

    //
    // data: {
    //     'key': 'YOUR_KEY',
    //         'message': {
    //         'from_email': 'YOUR_SENDER@example.com',
    //             'to': [
    //             {
    //                 'email': 'YOUR_RECEIVER@example.com',
    //                 'name': 'YOUR_RECEIVER_NAME',
    //                 'type': 'to'
    //             }
    //         ],
    //             'subject': 'title',
    //             'html': 'html can be used'
    //     }
    // }

    contactMe.sendEmail = sendEmail;

}]);

cv_app.controller('resumeCtrl',['cvDataService',function(cvDataService){

    var resume = this;

    cvDataService.getData(function(data){
        // console.log('cv data returned from json --',data);
        resume.education = data.cv_data.Resume.Education;
        resume.work_experiences = data.cv_data.Resume.WorkExperience;

        resume.skills = data.cv_data.Resume.SkillSet;

    }, function(error){
        console.log('fetch error--',error);
    });


}]);

//DIRECTIVES

cv_app.directive('workEducation', function () {

    return{
        restrict : 'E',
        templateUrl: 'templates/workExperienceDir.html',
        link : function (scope, element, attrs) {
            if (attrs.type === 'work')
                scope.img_type = 'work';
            else if (attrs.type === 'education')
                scope.img_type = 'education'
            console.log("inside link function the img type is  == "+scope.img_type);
        }
    }
});

cv_app.directive('skillPanel', function () {
   return{
       restrict: 'E',
       scope:{
           skillname:"=",
           skillset:"="
       },
       templateUrl: 'templates/skillPanelDir.html',
       controllerAs: 'skillPanelCtrl',
       controller: function () {
           var ctrl = this;
               ctrl.skillset_type = function (skillset) {
                   var stype = (typeof skillset === 'string') ? 'string' : 'array';
                   console.log("stype inside skill panel ctrl == "+stype +"for skillset "+skillset);
                   return stype;
               },

               ctrl.processSkill = function (skill) {
                   var skill_parts = skill.split("-");
                   return skill_parts;
               }



       }

   }
});

// SERVICES

cv_app.service('cvDataService', function ($resource) {
return $resource('cv_data.json',{},{
    getData: {
        method: 'GET',
        isArray: false,
        transformResponse: function (data, headers) {
            return {cv_data : angular.fromJson(data)}
        }
    }
});
});


cv_app.service('EmailService', function($resource){

   return $resource('https://mandrillapp.com/api/1.0/messages/send.json',{},{
       sendEmail:{
           method:"POST"

       }
   })
});
